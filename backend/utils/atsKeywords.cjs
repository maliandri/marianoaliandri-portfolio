// utils/atsKeywords.cjs
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { normalizeText } = require("./textUtils.cjs");

const DATA_DIR = path.join(__dirname, "..", "data");

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath, { encoding: "utf8" })
      .pipe(csv({ separator: ",", mapHeaders: ({ header }) => header.trim() }))
      .on("data", (r) => rows.push(r))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function loadAtsDictionary() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".csv"));
  if (!files.length) throw new Error("No se encontraron CSVs en /data");

  const all = [];
  for (const fname of files) {
    const full = path.join(DATA_DIR, fname);
    const rows = await readCsv(full);

    for (const r of rows) {
      const profesion = (r.profesion || "").trim();
      const rawSkills = (r.skills_keywords || "").trim();
      if (!profesion || !rawSkills) continue;

      const skills = rawSkills
        .split(/;|\|/g)
        .map(s => s.trim())
        .filter(Boolean);

      all.push({
        major_group: (r.major_group || "").trim(),
        sub_major_group: (r.sub_major_group || "").trim(),
        minor_group: (r.minor_group || "").trim(),
        unit_group: (r.unit_group || "").trim(),
        profesion,
        skills_keywords: rawSkills,
        skills,
        slug: normalizeText(profesion).replace(/\s+/g, "-"),
        groupSlug: normalizeText(r.major_group || "").replace(/\s+/g, "-"),
      });
    }
  }
  // de-dup
  const seen = new Set();
  return all.filter(x => {
    const key = `${x.profesion}::${x.skills_keywords}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchTextAgainstProfession(text, prof) {
  const norm = normalizeText(text);
  const found = [];
  const missing = [];

  for (const skill of prof.skills) {
    const needle = normalizeText(skill);
    (norm.includes(needle) ? found : missing).push(skill);
  }
  const score = Math.round((found.length / Math.max(prof.skills.length, 1)) * 100);

  return {
    profesion: prof.profesion,
    major_group: prof.major_group,
    sub_major_group: prof.sub_major_group,
    minor_group: prof.minor_group,
    unit_group: prof.unit_group,
    score,
    skills_total: prof.skills.length,
    skills_found: found,
    skills_missing: missing,
  };
}

function rankProfessionsForText(text, dict, { topN = 5, target } = {}) {
  const pool = target
    ? dict.filter(p => normalizeText(p.profesion).includes(normalizeText(target)))
    : dict;

  const results = pool.map(p => matchTextAgainstProfession(text, p));
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

module.exports = { loadAtsDictionary, rankProfessionsForText };
