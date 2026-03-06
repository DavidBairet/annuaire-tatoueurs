document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".togglePassword");
  const passwordInput = document.getElementById("password");

  if (!toggle || !passwordInput) return;

  toggle.addEventListener("click", (e) => {
    e.preventDefault();

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "🙈" : "👁";
    toggle.setAttribute(
      "aria-label",
      isHidden ? "Masquer le mot de passe" : "Afficher le mot de passe"
    );
  });
});