import { Resolver, Mutation, Arg, Ctx, Query, ID } from "type-graphql";

import {
  Challenge,
  NewChallenge,
  SuccessResponse,
  findInput,
  ModifyChallenge
} from "../schema/ChallengeSchema";
import {
  addChallenge,
  getChallenges,
  deleteChallenge,
  modifyChallenge
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
}
