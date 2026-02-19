require("dotenv").config();

const express = require("express");
const path = require("node:path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const MongoStore = ConnectMongo.create ? ConnectMongo : ConnectMongo.default;
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const User = require("./models/User");

const indexRouter = require("./routes/indexRouter");
const artistsRouter = require("./routes/artistsRouter");
const adminRouter = require("./routes/adminRouter"); 
const adviceRouter = require("./routes/adviceRouter");
const lexiqueRouter = require("./routes/lexiqueRouter");

const app = express();

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares de base
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Sessions (stockées en MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),


    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    },
  })
);

// Seed admin (si pas déjà créé)
async function ensureAdminExists() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const pass = process.env.ADMIN_PASSWORD || "";

  if (!email || !pass) {
    console.warn("⚠️ ADMIN_EMAIL / ADMIN_PASSWORD manquants dans .env (admin non créé)");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("ℹ️ Admin déjà présent :", email);
    return;
  }

  const passwordHash = await bcrypt.hash(pass, 12);
  await User.create({ email, passwordHash, role: "admin" });
  console.log("✅ Admin créé :", email);
}

// Routes
app.use("/", indexRouter);
app.use("/artists", artistsRouter);
app.use("/admin", adminRouter);
app.use("/conseils", adviceRouter);
app.use("/lexique", lexiqueRouter);
app.get("/inscription", (req, res) => res.redirect("/artists/apply"));

// 404

app.use((req, res) => res.status(404).send("404 - Page not found"));

// Démarrage (connexion DB puis listen)
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();          // IMPORTANT : connectDB doit retourner une promise
  await ensureAdminExists();  // crée admin si besoin

  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();
