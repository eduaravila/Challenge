import moment from "moment";
import { ApolloError } from "apollo-server-express";

import challengeModel from "../models/challenge";
import {
  NewChallenge,
  findInput,
  ModifyChallenge,
  RandomChallenge
} from "../schema/ChallengeSchema";
import JwtAdmin from "../utils/jwtAdmin";
import Jwt from "../utils/jwt";
import jwtTicket from "../utils/jwtTicket";
import { decrypt, encrypt } from "../utils/crypt";

export const addChallenge = async (
  {
    title,
    subtitle,
    badges,
    points,
    rarity,
    description,
    portrait,
    arena,
    gendre,
    minAge
  }: NewChallenge,
  ctx: any
) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();
    if (ctx.req.ipInfo.error) {
      ctx.req.ipInfo = {};
    }

    let {
      country = "",
      region = "",
      city = "",
      timezone = "",
      ll = []
    } = ctx.req.ipInfo;

    let cripted_points = encrypt(points.toString());

    let newChallenge = new challengeModel({
      title,
      subtitle,
      badges,
      points: cripted_points,
      rarity,
      created_by: tokenData.userId,
      updated_by: tokenData.userId,
      description,
      portrait,
      arena,
      gendre,
      minAge,
      location: {
        country,
        region,
        city,
        timezone,
        ll
      }
    });

    await newChallenge.save();

    return Promise.resolve(`${newChallenge._id} succesfully created`);
  } catch (error) {
    console.log(error);

    return new ApolloError(error);
  }
};

export const getChallenges = async ({
  page = 0,
  size = 0,
  search
}: findInput) => {
  try {
    let offset = page * size;
    let limit = offset + size;

    let result =
      search.length > 0
        ? await challengeModel
            .find({
              $or: [
                { title: { $regex: ".*" + search + ".*" } },
                { _id: { $regex: ".*" + search + ".*" } },
                { arena: { $regex: ".*" + search + ".*" } }
              ]
            })
            .skip(offset)
            .limit(limit)
            .lean()
        : await challengeModel
            .find({})
            .skip(offset)
            .limit(limit)
            .lean();
    let descripted_result = result.map(i => ({
      ...i,
      points: decrypt(i.points)
    }));
    return Promise.resolve(descripted_result);
  } catch (error) {
    new ApolloError(error);
  }
};

export const deleteChallenge = async ({ id }: any, ctx: any) => {
  try {
    let token = ctx.req.headers.token;

    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();

    let deletedChallenge = await challengeModel.delete(
      { $and: [{ _id: id }, { created_by: tokenData.userId }] },
      tokenData.userId
    );

    return Promise.resolve(`${deletedChallenge._id} succesfully created`);
  } catch (error) {
    new ApolloError(error);
  }
};

export const modifyChallenge = async (
  {
    id,
    title,
    subtitle,
    badges,
    points,
    rarity,
    description,
    portrait,
    arena,
    gendre,
    minAge
  }: ModifyChallenge,
  ctx: any
) => {
  try {
    if (ctx.req.ipInfo.error) {
      ctx.req.ipInfo = {};
    }

    let {
      country = "",
      region = "",
      city = "",
      timezone = "",
      ll = []
    } = ctx.req.ipInfo;

    let token = ctx.req.headers.token;
    let localToken = await JwtAdmin.validateToken(token);

    let tokenData: any = await JwtAdmin.decrypt_data(localToken)();
    let pointsEncripted = points ? encrypt(points.toString()) : undefined;

    let updatedChallenge = await challengeModel.findByIdAndUpdate(
      id,
      {
        title,
        subtitle,
        badges,
        points: pointsEncripted,
        rarity,
        created_by: tokenData.userId,
        updated_by: tokenData.userId,
        description,
        portrait,
        arena,
        gendre,
        minAge,
        updated_at: moment().format("YYYY-MM-DD/HH:mm:ZZ"),
        location: {
          country,
          region,
          city,
          timezone,
          ll
        }
      },
      { omitUndefined: true }
    );

    return Promise.resolve(`${updatedChallenge._id} succesfully updated`);
  } catch (error) {
    throw new ApolloError(error);
  }
};

export const getChallengePoints = async (
  currentChallengeToken: string,
  ctx: any
) => {
  try {
    let token = ctx.req.headers.token;
    let localToken = await Jwt.validateToken(
      token,
      ctx.req.body.variables.publicKey
    );
    let tokenData: any = await Jwt.decrypt_data(localToken)();

    let localTokenChallenge = await jwtTicket.validateToken(
      currentChallengeToken
    );
    let decryptlocalTokenChallenge: any = await jwtTicket.decrypt_data(
      localTokenChallenge
    )();

    let result = await challengeModel.findOne({
      _id: decryptlocalTokenChallenge.Challenge
    });

    let descripted_result = {
      ...result,
      points: decrypt(result.points)
    };

    let ticketToken = new jwtTicket({
      Challenge: decryptlocalTokenChallenge.Challenge,
      userId: tokenData.userId,
      rarity: result.rarity,
      points: descripted_result.points,
      created_at: decryptlocalTokenChallenge.created_at,
      closed_at: decryptlocalTokenChallenge.closed_at
    });
    await ticketToken.create_token("1h");

    return Promise.resolve({
      msg: `${decryptlocalTokenChallenge.Challenge} succesfully calculated`,
      code: "200",
      token: ticketToken.token
    });
  } catch (error) {
    console.log(error);

    throw new ApolloError(error);
  }
};

export const getRandomChallenge = async (
  { Arena, completedChallenges, Last }: RandomChallenge,
  ctx: any
) => {
  try {
    let token = ctx.req.headers.token;
    let localToken = await Jwt.validateToken(
      token,
      ctx.req.body.variables.publicKey
    );
    let tokenData: any = await Jwt.decrypt_data(localToken)();

    // gets just challenges that you are not already completed and not gave you the las challenge recomended
    let availableChallenges = await challengeModel
      .find({
        $and: [
          {
            arena: Arena
          },
          { _id: { $nin: [...completedChallenges.map(i => i._id)] } }
        ]
      })
      .lean();

    // ? last challenge recomended exist and the list is more than 1 just delete de last challenge from the posible list
    if (Last && availableChallenges.length > 1) {
      availableChallenges = [
        ...availableChallenges.filter(i => i._id !== Last)
      ];
    }

    const idx = Math.floor(Math.random() * availableChallenges.length);
    let recomendedChallenge = availableChallenges[idx];

    recomendedChallenge = {
      ...recomendedChallenge,
      points: decrypt(recomendedChallenge.points)
    };

    console.log(recomendedChallenge);

    return Promise.resolve(recomendedChallenge);
  } catch (error) {
    console.log(error);

    throw new ApolloError(error);
  }
};
