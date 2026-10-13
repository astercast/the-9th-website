const fs = require("fs");
const path = require("path");

function count(file, key) {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "v1", file), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed[key]) ? parsed[key].length : 0;
  } catch (e) {
    return 0;
  }
}

module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.end(
    JSON.stringify({
      status: "ok",
      site: "the-9th-website",
      chambers: 9,
      wishes: count("wishes.json", "wishes"),
      letters: count("letters.json", "letters"),
      scaleStops: count("scale.json", "stops"),
    })
  );
};
