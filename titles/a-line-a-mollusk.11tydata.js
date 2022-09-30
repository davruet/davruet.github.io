const parse = require("csv-parse/lib/sync");
const fs = require("fs");

function readCSV() {
  const input = fs.readFileSync("titles/a-line-a-mollusk/works.csv"); // fixme this suxx to hardcode this path here
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
  });
  let m = new Map(records.map((x)=>[x.Number, x]));

  console.log(`${records.length} records found.`);
  return Object.fromEntries(m);
}

let d = readCSV();
console.log("EXPORTING: " + module)

module.exports = {"works": d}

    