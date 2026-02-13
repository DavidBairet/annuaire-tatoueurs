const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    styles: [{ type: String, trim: true, maxlength: 40 }],
    instagram: { type: String, trim: true, maxlength: 200 },
    contact: { type: String, trim: true, maxlength: 200 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
