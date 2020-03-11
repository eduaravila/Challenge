import { Resolver, Mutation, Arg, Ctx, Query, ID } from "type-graphql";

import {
  Challenge,
  NewChallenge,
  SuccessResponse,
  findInput,
  ModifyChallenge,
  SuccessResponseTicketSingle,
  RandomChallenge
} from "../schema/ChallengeSchema";
import {
  addChallenge,
  getChallenges,
  deleteChallenge,
  modifyChallenge,
  getChallengePoints,
  getRandomChallenge
} from "../controllers/challenge";

@Resolver(of => Challenge)
export class ChallengeResolver {
  @Mutation(returns => SuccessResponse, {
    description: "Admin query 🔏"
  })
  async AddChallenge(
    @Arg("newChallenge", () => NewChallenge) newChallenge: NewChallenge,
    @Ctx() ctx: any
  ) {
    let msg = await addChallenge(newChallenge, ctx);
    return {
      msg,
      code: "200"
    };
  }

  @Query(returns => [Challenge])
  async challenges(@Arg("findInput", () => findInput) findInput: findInput) {
    let msg = await getChallenges(findInput);
    return [...msg];
  }

  @Query(returns => Challenge)
  async GetChallenge(
    @Arg("RandomChallenge", () => RandomChallenge)
    RandomChallenge: RandomChallenge,
    @Ctx() ctx: any
  ) {
    return await getRandomChallenge(RandomChallenge, ctx);
  }

  @Mutation(returns => SuccessResponse, {
    description: "Admin query 🔏"
  })
  async DeleteChallenge(@Arg("id", () => ID) id: number, @Ctx() ctx: any) {
    let msg = await deleteChallenge({ id }, ctx);
    return {
      msg,
      code: "200"
    };
  }

  @Mutation(returns => SuccessResponse, {
    description: "Admin query 🔏"
  })
  async ModifyChallenge(
    @Arg("ModifyChallenge", { nullable: true })
    modifyChallengeInput: ModifyChallenge,
    @Ctx() ctx: any
  ) {
    let msg = await modifyChallenge(modifyChallengeInput, ctx);
    return {
      msg,
      code: "200"
    };
  }

  @Mutation(returns => SuccessResponseTicketSingle)
  async GetChallengePoints(
    @Arg("CurrentChallengeoToken", { nullable: true })
    CurrentChallengeoToken: string,
    @Ctx() ctx: any
  ) {
    return await getChallengePoints(CurrentChallengeoToken, ctx);
  }
}
