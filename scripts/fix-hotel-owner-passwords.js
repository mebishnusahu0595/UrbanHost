// Run this script to fix existing hotel owners' passwords
// Usage: node scripts/fix-hotel-owner-passwords.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function fixHotelOwnerPasswords() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User');

        // Get all hotel owners
        const hotelOwners = await User.find({ role: 'hotelOwner' }).select('+password');

        console.log(`Found ${hotelOwners.length} hotel owners`);

        for (const owner of hotelOwners) {
            console.log(`\nProcessing: ${owner.email}`);

            // Ask admin to set new password for each owner
            // For now, we'll set a default password that admin can change later
            const defaultPassword = 'TajHotel@123'; // Change this

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);

            // Update directly to bypass pre-save hook
            await mongoose.model('User').updateOne(
                { _id: owner._id },
                { $set: { password: hashedPassword } }
            );

            console.log(`✓ Password reset for ${owner.email}`);
            console.log(`  New password: ${defaultPassword}`);
        }

        console.log('\n✅ All hotel owner passwords have been reset!');
        console.log('⚠️  Please ask hotel owners to change their passwords after first login.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixHotelOwnerPasswords();
