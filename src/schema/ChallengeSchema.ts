import {
  ObjectType,
  Field,
  Directive,
  Int,
  InputType,
  registerEnumType,
  ID
} from "type-graphql";
import { Type } from "class-transformer";
import mongoose from "mongoose";
import {
  Trim,
  SanitizerConstraint,
  SanitizerInterface,
  Sanitize
} from "class-sanitizer";

import { decrypt, encrypt } from "../utils/crypt";
import challenge_model from "../models/challenge";

@SanitizerConstraint()
export class toLowerCase implements SanitizerInterface {
  sanitize(text: string): string {
    return text.toLowerCase();
  }
}

@ObjectType()
export class SuccessResponse {
  @Field(type => String)
  msg?: string;

  @Field(type => String)
  code?: string;
}

@Directive("@extends")
@Directive(`@key(fields: "_id")`)
@ObjectType()
export class Arena {
  @Directive("@external")
  @Field(type => ID)
  _id: mongoose.Types.ObjectId;
}

enum rarityEmun {
  Normal = "normal",
  Epic = "epic",
  Legendary = "legendary"
}

enum gendreEmun {
  Famele = "famele",
  Male = "male",
  Nobinary = "nobinary"
}

registerEnumType(rarityEmun, {
  name: "rarityEmun"
});

registerEnumType(gendreEmun, {
  name: "gendreEmun"
});

@ObjectType()
export class BadgesObject {
  @Field(type => ID)
  type: mongoose.Types.ObjectId;

  @Field(type => ID)
  zone: mongoose.Types.ObjectId;

  @Field(type => ID)
  rarity: mongoose.Types.ObjectId;
}

@InputType()
export class BadgesObjectInput {
  @Field(type => ID)
  type: mongoose.Types.ObjectId;

  @Field(type => ID)
  zone: mongoose.Types.ObjectId;

  @Field(type => ID)
  rarity: mongoose.Types.ObjectId;
}

@InputType()
export class NewChallenge {
  @Field(type => String)
  title: string;

  @Field(type => String)
  subtitle: string;

  @Field(type => BadgesObjectInput)
  badges: BadgesObjectInput;

  @Field(type => Int)
  points: number;

  @Field(type => rarityEmun)
  rarity: rarityEmun;

  @Field(type => [String])
  description: [string];

  @Field(type => ID)
  portrait: mongoose.Types.ObjectId;

  @Field(type => String)
  arena: string;

  @Field(type => gendreEmun)
  gendre: gendreEmun;

  @Field(type => Int)
  minAge: number;
}

@InputType()
export class EditChallenge {
  @Field(type => String, { nullable: true })
  title: string;

  @Field(type => String, { nullable: true })
  subtitle: string;

  @Field(type => BadgesObjectInput, { nullable: true })
  badges: BadgesObjectInput;

  @Field(type => Int, { nullable: true })
  points: number;

  @Field(type => rarityEmun, { nullable: true })
  rarity: rarityEmun;

  @Field(type => [String], { nullable: true })
  description: [string];

  @Field(type => ID, { nullable: true })
  portrait: mongoose.Types.ObjectId;

  @Field(type => String, { nullable: true })
  arena: string;

  @Field(type => gendreEmun, { nullable: true })
  gendre: gendreEmun;

  @Field(type => Int, { nullable: true })
  minAge: number;
}

@InputType({ description: "Modify an existing challenge" })
export class ModifyChallenge extends EditChallenge {
  @Field(type => ID)
  id: mongoose.Types.ObjectId;
}

@Directive(`@key(fields:"_id")`)
@ObjectType()
export class Challenge {
  @Field(type => String, { nullable: false })
  _id: string;

  @Field(type => String, { nullable: true })
  title: string;

  @Field(type => String, { nullable: true })
  subtitle: string;

  @Field(type => BadgesObject)
  badges: BadgesObject;

  @Field(type => String, { nullable: true })
  points: string;

  @Field(type => rarityEmun, { nullable: true })
  rarity: rarityEmun;

  @Field(type => [String], { nullable: true })
  description: [string];

  @Field(type => String, { nullable: true })
  portrait: string;

  @Type(() => Arena)
  @Field({ nullable: true })
  arena: Arena;

  @Field(type => gendreEmun, { nullable: true })
  gendre: gendreEmun;

  @Field(type => Int, { nullable: true })
  minAge: number;

  @Field(type => String, { nullable: true })
  created_at: string;

  @Field(type => String, { nullable: true })
  updated_at: string;

  @Field(type => ID, { nullable: true })
  updated_by: mongoose.Types.ObjectId;

  @Field(type => ID, { nullable: true })
  created_by: mongoose.Types.ObjectId;
}

@InputType()
export class findInput {
  @Field(type => Int, { nullable: true })
  page: number;

  @Field(type => Int, { nullable: true })
  size: number;

  @Field(type => String, { nullable: true, defaultValue: "" })
  @Trim()
  @Sanitize(toLowerCase)
  search: string;
}

export async function resolveChallengeReference(
  reference: Pick<Challenge, "_id">
): Promise<Challenge> {
  let result = await challenge_model.findOne({ _id: reference._id });
  let descripted_result = { ...result, points: decrypt(result.points) };
  return descripted_result;
}
