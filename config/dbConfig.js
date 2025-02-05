// dbConfig.js
const mongoose = require('mongoose');

exports.db = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION)
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with an error
  }
};

