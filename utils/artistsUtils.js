function cleanText(v = "") {
  return String(v).trim();
}

function cleanList(v = "") {
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function cleanUrl(v = "") {
  const url = String(v).trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function cleanPhone(v = "") {
  const digits = String(v).replace(/\D/g, "");
  if (digits.length === 10) return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  return digits;
}

function deptFromPostal(cp) {
  const s = String(cp || "").trim();
  if (!s) return "";
  if (s.startsWith("97") || s.startsWith("98")) return s.slice(0, 3);
  return s.slice(0, 2);
}

function escapeRegex(s = "") {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForSearch(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

module.exports = {
  cleanText,
  cleanList,
  cleanUrl,
  cleanPhone,
  deptFromPostal,
  escapeRegex,
  normalizeForSearch,
};