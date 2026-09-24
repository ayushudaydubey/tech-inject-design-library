import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "admin";

export interface IRefreshToken {
  tokenHash: string;
  createdAt: Date;
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isPremium: boolean;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeUser(): SafeUser;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    refreshTokens: {
      type: [RefreshTokenSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password using bcrypt
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe DTO mapper excluding password and internal tokens
UserSchema.methods.toSafeUser = function (): SafeUser {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isPremium: this.isPremium,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
