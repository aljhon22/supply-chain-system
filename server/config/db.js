const mongoose = require('mongoose');

// This is an "asynchronous" function, meaning the server will wait for 
// the cloud database to respond before moving on.
const connectDB = async () => {
  try {
    // Attempt to connect using the secret password from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB successfully connected to: ${conn.connection.host}`);
  } catch (error) {
    // If the password is wrong or IPs aren't whitelisted, print the error and crash safely
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;