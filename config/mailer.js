const nodemailer = require("nodemailer");

function getBaseUrl() {
  return process.env.BASE_URL || "http://localhost:3000";
}

function isConsoleMode() {
  return (process.env.MAIL_MODE || "smtp") === "console";
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: String(process.env.MAIL_SECURE || "true") === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  if (isConsoleMode()) {
    console.log("📩 [MAIL_MODE=console] Email");
    console.log("To:", to);
    console.log("Subject:", subject);
    if (text) console.log("Text:", text);
    if (html) console.log("HTML:", html);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"Annuaire Tatoueurs" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

async function sendVerificationEmail(email, token) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/artists/verify/${token}`;

  return sendMail({
    to: email,
    subject: "Vérification de votre email",
    text: [
      "Confirme ton email",
      "",
      "Clique sur ce lien (valide 24h) :",
      url,
    ].join("\n"),
    html: `
      <h2>Confirme ton email</h2>
      <p>Clique sur ce lien (valide 24h) :</p>
      <p><a href="${url}">${url}</a></p>
    `,
  });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
};