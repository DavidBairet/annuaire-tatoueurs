require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const path = require("node:path");

const indexRouter = require("./routes/indexRouter");
const artistsRouter = require("./routes/artistsRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/artists", artistsRouter);

app.use((req, res) => res.status(404).send("404 - Page not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
