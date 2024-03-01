const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String
    },
    status: {
      type: String,
      default: "active",
      trim: true
    },
    role: {
      type: String,
      default: "ADMIN",
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

UserSchema.methods.isValidPassword = async function(password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

const User = mongoose.model("CMS-User", UserSchema);
module.exports = User;
