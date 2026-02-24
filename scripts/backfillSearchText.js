require("dotenv").config();
const mongoose = require("mongoose");
const Artist = require("../models/Artist");

function normalizeForSearch(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");

    const artists = await Artist.find({});
    console.log("Artistes trouvés:", artists.length);

    let updated = 0;

    for (const a of artists) {
      const full = [
        a.name,
        a.city,
        (a.styles || []).join(" "),
        a.postalCode,
        a.department,
      ].join(" ");

      const searchText = normalizeForSearch(full);

      await Artist.updateOne(
        { _id: a._id },
        { $set: { searchText } }
      );

      updated++;
    }

    console.log("✅ searchText généré pour", updated, "artistes");
    process.exit(0);

  } catch (err) {
    console.error("❌ Erreur:", err);
    process.exit(1);
  }
}

run();