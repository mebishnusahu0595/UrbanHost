/**
 * Test script to update a property and generate a notification with hotel info
 */
import dbConnect from './lib/mongodb';
import Hotel from './models/Hotel';
import User from './models/User';
import { createNotification } from './lib/notifications';

async function testNotification() {
  await dbConnect();
  
  // Find first hotel
  const hotel = await Hotel.findOne({});
  
  if (!hotel) {
    console.log('❌ No hotels found in database');
    process.exit(1);
  }
  
  console.log(`\n✅ Found hotel: ${hotel.name} (ID: ${hotel._id})\n`);
  
  // Find an admin user
  const adminUser = await User.findOne({ role: 'admin' });
  
  if (!adminUser) {
    console.log('❌ No admin user found in database');
    process.exit(1);
  }
  
  console.log(`✅ Found admin: ${adminUser.name}\n`);
  
  // Create a test notification with hotel info
  await createNotification({
    type: 'HOTEL_UPDATE',
    title: 'Test Property Update',
    message: `Testing notification system with hotel information for: ${hotel.name}`,
    userId: adminUser._id,
    userName: adminUser.name,
    userRole: 'admin',
    hotelId: hotel._id,
    hotelName: hotel.name,
    changeDetails: [
      {
        field: 'description',
        oldValue: 'Old description text',
        newValue: 'New updated description text'
      },
      {
        field: 'checkInTime',
        oldValue: '12:00 PM',
        newValue: '2:00 PM'
      }
    ]
  });
  
  console.log('✅ Test notification created with hotel info!\n');
  console.log('   - Hotel Name: ' + hotel.name);
  console.log('   - Hotel ID: ' + hotel._id);
  console.log('   - Change Details: 2 fields changed\n');
  console.log('📱 Check the admin notifications page now!\n');
  
  process.exit(0);
}

testNotification().catch(console.error);
