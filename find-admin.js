const mongoose = require('mongoose');
require('dotenv').config();

async function findAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
    const admin = await User.findOne({ role: 'admin' });
    console.log(JSON.stringify(admin));
    await mongoose.disconnect();
}

findAdmin();
