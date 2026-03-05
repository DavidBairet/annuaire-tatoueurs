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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },

    address1: {
      type: String,
      trim: true,
      maxlength: 120,
      index: true,
    },

    address2: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },

    postalCode: {
      type: String,
      trim: true,
      maxlength: 10,
      index: true,
    },

    department: {
      type: String,
      trim: true,
      maxlength: 50,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    styles: [
      {
        type: String,
        trim: true,
        maxlength: 40,
        index: true,
      },
    ],

    instagram: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    facebook: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    website: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1200,
    },

    gallery: {
      type: [String],
      default: [],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifyToken: {
      type: String,
      default: null,
      index: true,
    },

    verifyTokenExpires: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    source: {
      type: String,
      enum: ["self", "admin"],
      default: "self",
      index: true,
    },

    searchText: {
      type: String,
      default: "",
      index: true,
    },
  },
  { timestamps: true }
);

artistSchema.pre("save", function () {
  const full = [
    this.name,
    this.address1 || "",
    this.address2 || "",
    this.city,
    this.postalCode,
    this.department,
    (this.styles || []).join(" "),
    this.email || "",
  ].join(" ");

  this.searchText = normalizeForSearch(full);
});

module.exports = mongoose.model("Artist", artistSchema);