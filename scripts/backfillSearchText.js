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
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI manquant dans .env");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté");

    const artists = await Artist.find({}, { name: 1, city: 1, styles: 1, postalCode: 1, department: 1 });
    console.log("Artistes trouvés:", artists.length);

    const ops = artists.map((a) => {
      const full = [
        a.name,
        a.city,
        (a.styles || []).join(" "),
        a.postalCode,
        a.department,
      ]
        .filter(Boolean)
        .join(" ");

      const searchText = normalizeForSearch(full);

      return {
        updateOne: {
          filter: { _id: a._id },
          update: { $set: { searchText } },
        },
      };
    });

    let updated = 0;

    if (ops.length) {
      const result = await Artist.bulkWrite(ops, { ordered: false });
      updated = (result.modifiedCount ?? 0) + (result.upsertedCount ?? 0);
    }

    console.log("✅ searchText généré (bulk) - opérations:", ops.length, "| modifiés:", updated);
  } catch (err) {
    console.error("❌ Erreur:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB déconnecté");
  }
}

run();