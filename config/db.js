const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI manquant dans le fichier .env");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté");
    return true;
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err.message);
    return false;
  }
}

module.exports = connectDB;

