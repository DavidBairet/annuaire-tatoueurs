require("dotenv").config();

const express = require("express");
const path = require("node:path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const bcrypt = require("bcrypt");

const User = require("./models/User");

const indexRouter = require("./routes/indexRouter");
const artistsRouter = require("./routes/artistsRouter");
const adminRouter = require("./routes/adminRouter");
const adviceRouter = require("./routes/adviceRouter");

const app = express();

// =========================
// CONFIG
// =========================

const PORT = process.env.PORT || 3000;
const USE_MONGO = process.env.USE_MONGO === "true" && !!process.env.MONGO_URI;

// =========================
// VIEWS
// =========================

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// =========================
// MIDDLEWARES
// =========================

app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// =========================
// SESSIONS
// =========================

if (USE_MONGO) {

  console.log("🟢 Sessions MongoDB activées");

  app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,

    store: ConnectMongo.create({
      mongoUrl: process.env.MONGO_URI,
    }),

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },

  }));

} else {

  console.log("🟡 Mode DEV sans MongoDB");

  app.use(session({
    secret: "dev-secret-temporaire",
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },

  }));

}

// =========================
// ADMIN SEED
// =========================

async function ensureAdminExists() {

  if (!USE_MONGO) return;

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const pass = process.env.ADMIN_PASSWORD || "";

  if (!email || !pass) {
    console.log("ℹ️ Admin seed ignoré (pas de variables)");
    return;
  }

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("ℹ️ Admin déjà existant");
    return;
  }

  const passwordHash = await bcrypt.hash(pass, 12);

  await User.create({
    email,
    passwordHash,
    role: "admin"
  });

  console.log("✅ Admin créé");
}

// =========================
// ROUTES
// =========================

app.use("/", indexRouter);
app.use("/artists", artistsRouter);
app.use("/admin", adminRouter);
app.use("/conseils", adviceRouter);

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// =========================
// START SERVER
// =========================

async function startServer() {

  if (USE_MONGO) {

    const connectDB = require("./config/db");

    await connectDB();

    await ensureAdminExists();

  } else {

    console.log("⚠️ MongoDB désactivé");

  }

  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
  });

}

startServer();
