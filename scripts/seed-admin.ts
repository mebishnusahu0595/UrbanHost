import dbConnect from '../lib/mongodb';
import User from '../models/User';

async function seedAdmin() {
  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@stayntour.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('Email: admin@stayntour.com');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@stayntour.com',
      password: 'StayNTour123!',
      role: 'admin',
      phone: '+91-9999999999'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@stayntour.com');
    console.log('Password: StayNTour123!');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
