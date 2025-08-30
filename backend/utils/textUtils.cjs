// utils/textUtils.cjs
function normalizeText(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9áéíóúüñ\s./-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function tokenize(s = "") { return normalizeText(s).split(" "); }

module.exports = { normalizeText, tokenize };
