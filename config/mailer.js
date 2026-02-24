const nodemailer = require("nodemailer");

function getBaseUrl() {
  return process.env.BASE_URL || "http://localhost:3000";
}

async function sendVerificationEmail(email, token) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/artists/verify/${token}`;

  // ✅ MODE DEV : pas d'envoi, on affiche juste
  if ((process.env.MAIL_MODE || "gmail") === "console") {
    console.log("📩 [MAIL_MODE=console] Email de vérification");
    console.log("To:", email);
    console.log("Lien:", url);
    return;
  }

  // ✅ MODE PROD : envoi via Gmail (mot de passe d'app)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Annuaire Tatoueurs" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Vérification de votre email",
    html: `
      <h2>Confirme ton email</h2>
      <p>Clique sur ce lien (valide 24h) :</p>
      <p><a href="${url}">${url}</a></p>
    `,
  });
}

module.exports = sendVerificationEmail;