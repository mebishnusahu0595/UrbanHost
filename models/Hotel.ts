import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom {
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  features: string[]; // Custom features like "Balcony", "Sea View", etc.
  images: string[];
  available: number;
}

export interface IAddon {
  name: string;
  price: number;
  description?: string;
}

export interface IHotel extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  embedUrl?: string;
  images: string[];
  photos?: {
    exterior?: string[];
    interior?: string[];
  };
  amenities: string[];
  rooms: IRoom[];
  addons: IAddon[];
  rating: number;
  totalReviews: number;
  owner?: mongoose.Types.ObjectId;
  status: 'draft' | 'pending' | 'submitted' | 'approved' | 'published' | 'rejected';
  featured: boolean;
  labels: string[]; // Featured, Urban Host Properties, Luxury, Budget-Friendly, etc.
  category: string; // Hotel, Resort, Villa, Apartment, etc.
  documents: {
    // Ownership Proof
    ownershipProof?: string; // Sale deed / Registry
    leaseAgreement?: string; // Rent/Lease Agreement
    authorizationLetter?: string; // Authorization Letter

    // Property Address Proof
    propertyAddressProof?: string; // Electricity/Water Bill/Tax Receipt
    googleLocationLink?: string; // Google Maps Link

    // Owner KYC
    panCard?: string; // PAN Card
    aadhaarCard?: string; // Aadhaar Card
    passport?: string; // Passport (optional)
    voterID?: string; // Voter ID (optional)
    ownerPhoto?: string; // Passport size photo

    // Business Registration
    gstCertificate?: string; // GST Certificate
    msmeRegistration?: string; // MSME/Udyam Registration
    partnershipDeed?: string; // Partnership Deed
    incorporationCertificate?: string; // Certificate of Incorporation

    // Bank Details
    cancelledCheque?: string; // Cancelled Cheque
    bankPassbook?: string; // Bank Passbook

    // Licenses & Compliance
    tradeLicense?: string; // Trade License
    hotelLicense?: string; // Hotel License
    fireSafetyCertificate?: string; // Fire Safety Certificate
    pollutionCertificate?: string; // Pollution/NOC Certificate

    // Optional Premium Documents
    fssaiLicense?: string; // FSSAI License
    liquorLicense?: string; // Liquor License
    poolSafetyCertificate?: string; // Swimming Pool Safety
    insuranceCertificate?: string; // Insurance Coverage
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  checkInTime: string;
  checkOutTime: string;
  policies: {
    cancellation: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  highlights: {
    coupleFriendly: string;
    bookAtZero: boolean;
    mobileDeal: string;
    cancellation: string;
  };
  bankDetails: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  emergencyContacts: {
    propertyManagerName?: string;
    primaryContact?: string;
    alternateContact?: string;
    email?: string;
  };
  pricingInfo: {
    baseRoomTariff?: number;
    weekendRate?: number;
    peakSeasonRate?: number;
  };
  agreementSigned: boolean;
  agreementDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  amenities: [String],
  features: [String],
  images: [String],
  available: {
    type: Number,
    required: true,
    min: 0,
  },
});

const hotelSchema = new Schema<IHotel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    embedUrl: String,
    images: {
      type: [String],
      required: true,
    },
    photos: {
      exterior: [String],
      interior: [String],
    },
    amenities: [String],
    rooms: {
      type: [roomSchema],
      required: true,
    },
    addons: {
      type: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: String,
      }],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Owner assigned only after admin approval
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'submitted', 'approved', 'published', 'rejected'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    labels: {
      type: [String],
      default: [],
      // e.g., ['Featured', 'Urban Host Properties', 'Luxury', 'Budget-Friendly']
    },
    category: {
      type: String,
      enum: ['Hotel', 'Resort', 'Villa', 'Apartment', 'Guesthouse', 'Hostel', 'Boutique'],
      default: 'Hotel',
    },
    documents: {
      // Ownership Proof
      ownershipProof: String,
      leaseAgreement: String,
      authorizationLetter: String,

      // Property Address Proof
      propertyAddressProof: String,
      googleLocationLink: String,

      // Owner KYC
      panCard: String,
      aadhaarCard: String,
      passport: String,
      voterID: String,
      ownerPhoto: String,

      // Business Registration
      gstCertificate: String,
      msmeRegistration: String,
      partnershipDeed: String,
      incorporationCertificate: String,

      // Bank Details
      cancelledCheque: String,
      bankPassbook: String,

      // Licenses & Compliance
      tradeLicense: String,
      hotelLicense: String,
      fireSafetyCertificate: String,
      pollutionCertificate: String,

      // Optional Premium Documents
      fssaiLicense: String,
      liquorLicense: String,
      poolSafetyCertificate: String,
      insuranceCertificate: String,
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: String,
    },
    checkInTime: {
      type: String,
      default: '14:00',
    },
    checkOutTime: {
      type: String,
      default: '11:00',
    },
    policies: {
      cancellation: {
        type: String,
        default: 'Standard Policy',
      },
      petPolicy: {
        type: String,
        default: 'Pets not allowed',
      },
      smokingPolicy: {
        type: String,
        default: 'No smoking',
      },
    },
    highlights: {
      coupleFriendly: {
        type: String,
        default: 'Unmarried couples allowed | Local Id accepted',
      },
      bookAtZero: {
        type: Boolean,
        default: false,
      },
      mobileDeal: {
        type: String,
        default: '',
      },
      cancellation: {
        type: String,
        default: '',
      },
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
    },
    emergencyContacts: {
      propertyManagerName: String,
      primaryContact: String,
      alternateContact: String,
      email: String,
    },
    pricingInfo: {
      baseRoomTariff: Number,
      weekendRate: Number,
      peakSeasonRate: Number,
    },
    agreementSigned: {
      type: Boolean,
      default: false,
    },
    agreementDate: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
hotelSchema.index({ location: '2dsphere' });

const Hotel: Model<IHotel> = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;
