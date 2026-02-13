const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI est undefined (fichier .env non lu)");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté (Atlas)");
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
