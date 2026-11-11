// Golden test: the built site must match test/snapshots/ exactly, after whitespace
// normalisation. Run `npm run test:update` to accept a deliberate change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { SITE_DIR, SNAPSHOT_DIR, listFiles, normaliserFor } from "./site.js";

const update = process.env.UPDATE_SNAPSHOTS === "1";
const built = listFiles(SITE_DIR).filter(normaliserFor);

if (update) {
  rmSync(SNAPSHOT_DIR, { recursive: true, force: true });
  for (const file of built) {
    const target = join(SNAPSHOT_DIR, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(join(SITE_DIR, file)));
  }
}

test("the built site has exactly the snapshotted files", () => {
  assert.deepEqual(built, listFiles(SNAPSHOT_DIR));
});

for (const file of built) {
  test(`${file} matches its snapshot`, () => {
    const snapshot = join(SNAPSHOT_DIR, file);
    assert.ok(existsSync(snapshot), `no snapshot for ${file}`);
    const normalise = normaliserFor(file);
    assert.equal(
      normalise(readFileSync(join(SITE_DIR, file), "utf8")),
      normalise(readFileSync(snapshot, "utf8")),
    );
  });
}
