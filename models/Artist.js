const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    styles: [{ type: String, trim: true }],
    instagram: { type: String, trim: true },
    contact: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
