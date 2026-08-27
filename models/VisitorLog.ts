import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitorLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: string;
  ip: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  userAgent?: string;
  visitedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const visitorLogSchema = new Schema<IVisitorLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    userRole: {
      type: String,
      default: "guest",
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    accuracy: {
      type: Number,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast time-series aggregation by state/city
visitorLogSchema.index({ state: 1, city: 1, createdAt: -1 });

const VisitorLog: Model<IVisitorLog> =
  mongoose.models.VisitorLog || mongoose.model<IVisitorLog>("VisitorLog", visitorLogSchema);

export default VisitorLog;
