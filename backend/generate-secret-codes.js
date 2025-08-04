const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lexilearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateSecretCodes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Find all students without secret codes
    const studentsWithoutCodes = await User.find({
      role: 'student',
      $or: [
        { secretCode: { $exists: false } },
        { secretCode: null },
        { secretCode: '' }
      ]
    });

    console.log(`Found ${studentsWithoutCodes.length} students without secret codes`);

    if (studentsWithoutCodes.length === 0) {
      console.log('All students already have secret codes!');
      return;
    }

    // Generate secret codes for each student
    for (const student of studentsWithoutCodes) {
      const secretCode = student.generateSecretCode();
      student.secretCode = secretCode;
      await student.save();
      console.log(`Generated secret code for ${student.name}: ${secretCode}`);
    }

    console.log('Secret codes generated successfully!');

    // Show all students with their secret codes
    const allStudents = await User.find({ role: 'student' }).select('name email grade secretCode');
    console.log('\nAll students with secret codes:');
    allStudents.forEach(student => {
      console.log(`${student.name} (${student.grade}): ${student.secretCode}`);
    });

  } catch (error) {
    console.error('Error generating secret codes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
generateSecretCodes(); 