// Prints a unified diff between each built page and its snapshot, both normalised.
// Usage: node test/diff-snapshots.js [file...]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SITE_DIR, SNAPSHOT_DIR, listFiles, normaliserFor } from "./site.js";

const tmp = mkdtempSync(join(tmpdir(), "snapshot-diff-"));
const files = process.argv.slice(2).length ? process.argv.slice(2) : listFiles(SITE_DIR).filter(normaliserFor);

for (const file of files) {
  const normalise = normaliserFor(file);
  const read = (dir) => (existsSync(join(dir, file)) ? normalise(readFileSync(join(dir, file), "utf8")) + "\n" : "");
  const a = join(tmp, "snapshot"), b = join(tmp, "built");
  writeFileSync(a, read(SNAPSHOT_DIR));
  writeFileSync(b, read(SITE_DIR));
  try {
    execFileSync("diff", ["-u", "--label", `snapshot/${file}`, "--label", `built/${file}`, a, b]);
  } catch (error) {
    process.stdout.write(error.stdout);
  }
}
