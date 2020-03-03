import mongoose, { Schema, mongo } from "mongoose";
import mongoose_delete from "mongoose-delete";
import bc from "bcrypt";
import moment from "moment";
import { ChallengeModelType, ChallengeModelStaticsType } from "./types";

const Challenge_schema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  subtitle: {
    type: String,
    required: true
  },
  created_by: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  updated_by: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  badges: {
    type: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    zone: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    rarity: {
      type: mongoose.Types.ObjectId,
      required: true
    }
  },
  points: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    default: "normal",
    enum: ["normal", "epic", "legendary"]
  },
  created_at: {
    type: String,
    required: true,
    default: moment().format("YYYY-MM-DD/HH:mm:ZZ")
  },
  updated_at: {
    type: String,
    required: true,
    default: moment().format("YYYY-MM-DD/HH:mm:ZZ")
  },
  description: [
    {
      type: String,
      required: true
    }
  ],
  portrait: {
    type: String,
    required: true
  },
  arena: {
    type: mongoose.Types.ObjectId
  },
  gendre: {
    type: String,
    enum: ["famele", "male", "nobinary"]
  },
  minAge: {
    type: Number,
    required: true
  },
  location: {
    country: {
      type: String
    },
    region: {
      type: String
    },
    city: {
      type: String
    },
    timezone: {
      type: String
    },
    ll: {
      type: Array
    }
  }
});

Challenge_schema.plugin(mongoose_delete, {
  deletedAt: true,
  indexFields: true,
  overrideMethods: true,
  deletedBy: true
});

const challenge_model = mongoose.model<
  ChallengeModelType,
  ChallengeModelStaticsType
>("challenge", Challenge_schema);

export default challenge_model;
