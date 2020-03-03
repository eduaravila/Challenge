import moment from "moment";
import { ApolloError } from "apollo-server-express";

import challengeModel from "../models/challenge";
import {
  NewChallenge,
  findInput,
  ModifyChallenge
} from "../schema/ChallengeSchema";
import JwtAdmin from "../utils/jwtAdmin";
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
