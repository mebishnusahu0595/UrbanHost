import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'propertyOwner' | 'hotelOwner' | 'receptionist';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  assignedHotels?: mongoose.Types.ObjectId[]; // For hotelOwner role - hotels they can view
  assignedHotel?: mongoose.Types.ObjectId; // For receptionist - single hotel assignment
  dob?: Date;
  canEditHotels: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
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
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'propertyOwner', 'hotelOwner', 'receptionist'],
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    assignedHotels: [{
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
    }],
    assignedHotel: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    dob: {
      type: Date,
    },
    canEditHotels: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
