const mongoose = require('mongoose');
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, hopefully MONGODB_URI is in env
}

// Define Schema (Simplified for seeding)
const HotelSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    images: [String],
    amenities: [String],
    rooms: [{
        type: { type: String },
        price: Number,
        capacity: Number,
        available: Number,
        amenities: [String],
        features: [String],
        images: [String]
    }],
    owner: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'approved' },
    featured: { type: Boolean, default: false },
    labels: [String],
    contactInfo: {
        phone: String,
        email: String,
        website: String
    },
    category: String,
    rating: { type: Number, default: 4.5 },
    totalReviews: { type: Number, default: 0 },
    highlights: {
        coupleFriendly: String,
        bookAtZero: Boolean,
        mobileDeal: String,
        cancellation: String
    }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const realHotels = [
    {
        name: "Taj Mahal Palace",
        description: "The Taj Mahal Palace opened in Mumbai in 1903, giving birth to India's first harbor landmark. Facing the majestic Gateway of India, it offers a unique blend of heritage and modern luxury.",
        address: { street: "Apollo Bunder", city: "Mumbai", state: "Maharashtra", zipCode: "400001", country: "India" },
        images: [
            "https://images.unsplash.com/photo-1566650554919-44ec6bbe2518?q=80&w=1200",
            "https://images.unsplash.com/photo-1570160897040-dc42bf06277d?q=80&w=1200"
        ],
        amenities: ["Spa", "Pool", "Gym", "Fine Dining", "Valet Parking"],
        category: "Hotel",
        featured: true,
        labels: ["Featured", "Urban Host Properties", "Luxury"],
        rooms: [
            {
                type: "Luxury Room",
                price: 15000,
                capacity: 2,
                available: 10,
                amenities: ["WiFi", "Mini Bar"],
                features: ["City View", "King Size Bed", "Premium Linens"],
                images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800"]
            },
            {
                type: "Royal Suite",
                price: 45000,
                capacity: 3,
                available: 2,
                amenities: ["Butler Service", "Ocean View"],
                features: ["Living Room", "Walk-in Closet", "Luxury Bath"],
                images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"]
            },
            {
                type: "Sea View Room",
                price: 22000,
                capacity: 2,
                available: 5,
                amenities: ["WiFi", "Balcony"],
                features: ["Harbor View", "Work Desk", "Jacuzzi"],
                images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800"]
            }
        ],
        highlights: {
            coupleFriendly: "Unmarried couples allowed | Local Id accepted",
            bookAtZero: true,
            mobileDeal: "Extra 10% off on App",
            cancellation: "Flexible"
        }
    },
    {
        name: "Radisson Blu Palace Resort",
        description: "Overlooking the beautiful Fateh Sagar Lake, this palace resort in Udaipur is a perfect romantic getaway.",
        address: { street: "Near Fateh Sagar Lake", city: "Udaipur", state: "Rajasthan", zipCode: "313001", country: "India" },
        images: [
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200"
        ],
        amenities: ["Lake View", "Infinity Pool", "Cultural Shows", "Barbeque"],
        category: "Resort",
        featured: true,
        labels: ["Luxury", "Couple Friendly"],
        rooms: [
            {
                type: "Lake View Room",
                price: 8500,
                capacity: 2,
                available: 20,
                amenities: ["Balcony", "Tea/Coffee Maker"],
                features: ["Lake Facing", "Private Balcony", "Traditional Decor"],
                images: ["https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800"]
            },
            {
                type: "Family Suite",
                price: 18000,
                capacity: 4,
                available: 5,
                amenities: ["Living Area", "Kitchenette"],
                features: ["Garden View", "Multi-bedroom", "Interconnected"],
                images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800"]
            }
        ],
        highlights: {
            coupleFriendly: "Unmarried couples allowed",
            bookAtZero: true,
            mobileDeal: "5% discount on mobile",
            cancellation: "Free till 24h before"
        }
    }
];

async function seedHotels() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/urbanhost";
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log("No admin user found. Creating dummy admin...");
            // You might want to handle this better but for seeding script:
            // const dummyAdmin = new User({ email: 'admin@urbanhost.com', role: 'admin' });
            // await dummyAdmin.save();
            // admin = dummyAdmin;
        }

        const ownerId = admin ? admin._id : new mongoose.Types.ObjectId();

        // Cleanup
        const hotelNames = realHotels.map(h => h.name);
        await Hotel.deleteMany({ name: { $in: hotelNames } });
        console.log("Cleaned up existing hotel entries...");

        for (const data of realHotels) {
            const hotel = new Hotel({
                ...data,
                owner: ownerId,
                contactInfo: {
                    phone: "011-23456789",
                    email: `info@${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    website: `www.${data.name.toLowerCase().replace(/\s+/g, '')}.com`
                },
                totalReviews: Math.floor(Math.random() * 500) + 100,
                rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1),
                status: 'approved'
            });
            await hotel.save();
            console.log(`Seeded: ${data.name} with ${hotel.rooms.length} rooms`);
        }

        console.log("Seeding complete!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error seeding hotels:", error);
        process.exit(1);
    }
}

seedHotels();
