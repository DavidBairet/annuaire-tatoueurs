[1mdiff --git a/app.js b/app.js[m
[1mindex cb5dab9..d997cce 100644[m
[1m--- a/app.js[m
[1m+++ b/app.js[m
[36m@@ -6,161 +6,81 @@[m [mconst helmet = require("helmet");[m
 const cookieParser = require("cookie-parser");[m
 const session = require("express-session");[m
 const ConnectMongo = require("connect-mongo");[m
[32m+[m[32mconst MongoStore = ConnectMongo.create ? ConnectMongo : ConnectMongo.default;[m
 const bcrypt = require("bcrypt");[m
 [m
[32m+[m[32mconst connectDB = require("./config/db");[m
 const User = require("./models/User");[m
 [m
 const indexRouter = require("./routes/indexRouter");[m
 const artistsRouter = require("./routes/artistsRouter");[m
[31m-const adminRouter = require("./routes/adminRouter");[m
[31m-const adviceRouter = require("./routes/adviceRouter");[m
[32m+[m[32mconst adminRouter = require("./routes/adminRouter"); // on va le créer juste après[m
 [m
 const app = express();[m
 [m
[31m-// =========================[m
[31m-// CONFIG[m
[31m-// =========================[m
[31m-[m
[31m-const PORT = process.env.PORT || 3000;[m
[31m-const USE_MONGO = process.env.USE_MONGO === "true" && !!process.env.MONGO_URI;[m
[31m-[m
[31m-// =========================[m
[31m-// VIEWS[m
[31m-// =========================[m
[31m-[m
[32m+[m[32m// Views[m
 app.set("views", path.join(__dirname, "views"));[m
 app.set("view engine", "ejs");[m
 [m
[31m-// =========================[m
[31m-// MIDDLEWARES[m
[31m-// =========================[m
[31m-[m
[32m+[m[32m// Middlewares de base[m
 app.use(helmet());[m
 app.use(cookieParser());[m
 app.use(express.urlencoded({ extended: true }));[m
 app.use(express.static(path.join(__dirname, "public")));[m
 [m
[31m-// =========================[m
[31m-// SESSIONS[m
[31m-// =========================[m
[31m-[m
[31m-if (USE_MONGO) {[m
[31m-[m
[31m-  console.log("🟢 Sessions MongoDB activées");[m
[31m-[m
[31m-  app.use(session({[m
[32m+[m[32m// Sessions (stockées en MongoDB)[m
[32m+[m[32mapp.use([m
[32m+[m[32m  session({[m
     secret: process.env.SESSION_SECRET || "dev_secret_change_me",[m
     resave: false,[m
     saveUninitialized: false,[m
[32m+[m[32m    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),[m
 [m
[31m-    store: ConnectMongo.create({[m
[31m-      mongoUrl: process.env.MONGO_URI,[m
[31m-    }),[m
 [m
     cookie: {[m
       httpOnly: true,[m
       sameSite: "lax",[m
       secure: process.env.NODE_ENV === "production",[m
[31m-      maxAge: 1000 * 60 * 60 * 24 * 7,[m
[32m+[m[32m      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours[m
     },[m
[32m+[m[32m  })[m
[32m+[m[32m);[m
 [m
[31m-  }));[m
[31m-[m
[31m-} else {[m
[31m-[m
[31m-  console.log("🟡 Mode DEV sans MongoDB");[m
[31m-[m
[31m-  app.use(session({[m
[31m-    secret: "dev-secret-temporaire",[m
[31m-    resave: false,[m
[31m-    saveUninitialized: false,[m
[31m-[m
[31m-    cookie: {[m
[31m-      httpOnly: true,[m
[31m-      sameSite: "lax",[m
[31m-      secure: false,[m
[31m-      maxAge: 1000 * 60 * 60 * 24 * 7,[m
[31m-    },[m
[31m-[m
[31m-  }));[m
[31m-[m
[31m-}[m
[31m-[m
[31m-// =========================[m
[31m-// ADMIN SEED[m
[31m-// =========================[m
[31m-[m
[32m+[m[32m// Seed admin (si pas déjà créé)[m
 async function ensureAdminExists() {[m
[31m-[m
[31m-  if (!USE_MONGO) return;[m
[31m-[m
   const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();[m
   const pass = process.env.ADMIN_PASSWORD || "";[m
 [m
   if (!email || !pass) {[m
[31m-    console.log("ℹ️ Admin seed ignoré (pas de variables)");[m
[32m+[m[32m    console.warn("⚠️ ADMIN_EMAIL / ADMIN_PASSWORD manquants dans .env (admin non créé)");[m
     return;[m
   }[m
 [m
   const existing = await User.findOne({ email });[m
[31m-[m
   if (existing) {[m
[31m-    console.log("ℹ️ Admin déjà existant");[m
[32m+[m[32m    console.log("ℹ️ Admin déjà présent :", email);[m
    