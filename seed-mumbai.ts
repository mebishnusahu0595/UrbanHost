import dbConnect from './lib/mongodb';
import Hotel from './models/Hotel';
import User from './models/User';

async function seedHotel() {
    await dbConnect();

    const user = await User.findOne({ role: 'admin' }) || await User.findOne({});
    if (!user) {
        console.log("No user found to own the hotel");
        process.exit(1);
    }

    const hotelData = {
        name: "Mumbai Luxury Stay",
        description: "A beautiful stay in the heart of Mumbai",
        address: {
            street: "Marine Drive",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India"
        },
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
        amenities: ["WiFi", "Parking"],
        rooms: [{
            type: "Deluxe",
            price: 5000,
            capacity: 2,
            available: 5,
            amenities: ["TV"],
            features: ["Sea View"],
            images: []
        }],
        owner: user._id,
        status: 'approved',
        contactInfo: {
            phone: "1234567890",
            email: "mumbai@hotel.com"
        },
        policies: {
            cancellation: "Free",
            petPolicy: "No",
            smokingPolicy: "No"
        },
        highlights: {
            coupleFriendly: "Yes",
            bookAtZero: true,
            mobileDeal: "10% off",
            cancellation: "Free till tomorrow"
        }
    };

    const hotel = await Hotel.create(hotelData);
    console.log(`Hotel created: ${hotel.name} in ${hotel.address.city}`);
    process.exit(0);
}

seedHotel();
