require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'admin@busniyojak.local';
    const phone = '9800000000';
    const password = 'Admin@123';

    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      user = new User({
        name: 'Admin',
        email,
        phone,
        password,
        role: 'admin',
        status: 'active',
      });
      await user.save();
      console.log(`Created admin user: ${email} / ${password}`);
    } else {
      user.role = 'admin';
      user.status = 'active';
      user.password = password; // will be re-hashed by pre-save hook
      await user.save();
      console.log(`Updated existing user to admin: ${email} / ${password}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error seeding admin:', e);
    process.exit(1);
  }
})();
