require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const Artist = require("./models/Artist");
const connectDB = require("./config/db");
const User = require("./models/User");

const indexRouter = require("./routes/indexRouter");
const artistsRouter = require("./routes/artistsRouter");
const adminRouter = require("./routes/adminRouter");
const adviceRouter = require("./routes/adviceRouter");
const lexiqueRouter = require("./routes/lexiqueRouter");

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

const MongoStore = ConnectMongo.create ? ConnectMongo : ConnectMongo.default;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives, réessayez dans 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin/login", loginLimiter);
app.use("/artists/login", loginLimiter);
app.use("/artists/apply", loginLimiter);

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (process.env.MONGO_URI && MongoStore?.create) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  });
}

app.use(session(sessionOptions));

async function ensureAdminExists() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) return;

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) return;

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    email,
    passwordHash,
    role: "admin",
  });
}

app.use("/", indexRouter);
app.use("/artists", artistsRouter);
app.use("/admin", adminRouter);
app.use("/conseils", adviceRouter);
app.use("/lexique", lexiqueRouter);

app.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://annuaire-tatoueurs.fr";
    const artists = await Artist.find({}, "_id");

    let urls = `
  <url>
    <loc>${baseUrl}</loc>
    <priority>1.0</priority>
  </url>
  `;

    artists.forEach((artist) => {
      urls += `
  <url>
    <loc>${baseUrl}/artists/${artist._id}</loc>
    <priority>0.8</priority>
  </url>
  `;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    console.error("Erreur sitemap :", err.message);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/inscription", (req, res) => {
  res.redirect("/artists/apply");
});

app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 - Page introuvable",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Erreur serveur");
});
async function startServer() {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });

  try {
    const dbConnected = await connectDB();

    if (dbConnected) {
      await ensureAdminExists();
    } else {
      console.log("⚠️ Démarrage sans MongoDB pour le moment.");
    }
  } catch (err) {
    console.error(err);
  }
}

startServer();
