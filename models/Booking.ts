import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  hotel: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  roomType: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfRooms: number;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  checkedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId; // User who marked check-in (receptionist/admin)
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    hotel: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    guests: {
      adults: {
        type: Number,
        required: true,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: String,
    specialRequests: String,
    guestInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
