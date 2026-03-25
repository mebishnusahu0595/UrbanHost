import dbConnect from './lib/mongodb';
import Notification from './models/Notification';

async function checkNotifications() {
  await dbConnect();
  
  const notifications = await Notification.find({}).limit(10).sort({ createdAt: -1 });
  
  console.log('\n📋 Recent Notifications:');
  console.log('='.repeat(80));
  
  notifications.forEach((n, i) => {
    console.log(`\n${i + 1}. Type: ${n.type}`);
    console.log(`   Title: ${n.title}`);
    console.log(`   Message: ${n.message}`);
    console.log(`   Hotel ID: ${n.hotelId || 'NOT SET'}`);
    console.log(`   Hotel Name: ${n.hotelName || 'NOT SET'}`);
    console.log(`   Change Details: ${n.changeDetails ? 'YES (' + n.changeDetails.length + ' changes)' : 'NOT SET'}`);
    console.log(`   Created: ${n.createdAt}`);
  });
  
  console.log('\n' + '='.repeat(80));
  
  const withHotel = await Notification.countDocuments({ hotelName: { $exists: true, $ne: null } });
  const withoutHotel = await Notification.countDocuments({ 
    $or: [
      { hotelName: { $exists: false } },
      { hotelName: null }
    ]
  });
  
  console.log(`\n✅ Notifications WITH hotel info: ${withHotel}`);
  console.log(`❌ Notifications WITHOUT hotel info: ${withoutHotel}`);
  console.log(`📊 Total: ${withHotel + withoutHotel}\n`);
  
  process.exit(0);
}

checkNotifications().catch(console.error);
