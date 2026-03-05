require("dotenv").config();

const express = require("express");
const path = require("node:path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const bcrypt = require("bcrypt");

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

const MongoStore =
  (ConnectMongo && typeof ConnectMongo.create === "function" && ConnectMongo) ||
  (ConnectMongo && ConnectMongo.default && typeof ConnectMongo.default.create === "function" && ConnectMongo.default) ||
  null;

app.set("trust proxy", 1);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

if (process.env.MONGO_URI && MongoStore) {
  sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
}

app.use(session(sessionOptions));

async function ensureAdminExists() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const pass = process.env.ADMIN_PASSWORD || "";
  if (!email || !pass) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(pass, 12);
  await User.create({ email, passwordHash, role: "admin" });
}

app.use("/", indexRouter);
app.use("/artists", artistsRouter);
app.use("/admin", adminRouter);
app.use("/conseils", adviceRouter);
app.use("/lexique", lexiqueRouter);
app.get("/inscription", (req, res) => res.redirect("/artists/apply"));

app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Page introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Erreur serveur");
});

(async () => {
  try {
    await connectDB();
    await ensureAdminExists();
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();