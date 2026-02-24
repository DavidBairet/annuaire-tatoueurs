const mongoose = require("mongoose");

function normalizeForSearch(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, maxlength: 80 },

    postalCode: { type: String, trim: true, maxlength: 10, index: true },
    department: { type: String, trim: true, maxlength: 50, index: true },

    phone: { type: String, trim: true, maxlength: 30 },

    styles: [{ type: String, trim: true, maxlength: 40 }],

    instagram: { type: String, trim: true, maxlength: 200 },
    facebook: { type: String, trim: true, maxlength: 200 },
    website: { type: String, trim: true, maxlength: 200 },

    bio: { type: String, trim: true, maxlength: 1200 },

    // ✅ Auth
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      unique: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    // ✅ Vérification email
    emailVerified: { type: Boolean, default: false, index: true },
    verifyToken: { type: String, default: null, index: true },
    verifyTokenExpires: { type: Date, default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    searchText: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

artistSchema.pre("save", function () {
  const full = [
    this.name,
    this.city,
    (this.styles || []).join(" "),
    this.postalCode,
    this.department,
    this.email,
  ].join(" ");

  this.searchText = normalizeForSearch(full);
  
});

module.exports = mongoose.model("Artist", artistSchema);