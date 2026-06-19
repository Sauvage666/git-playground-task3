const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const { matches, edit } = require("../lib/store");

const NOTES_FILE = path.join(__dirname, "..", "notes.json");

function withCleanStore(notes, fn) {
  const prev = fs.existsSync(NOTES_FILE) ? fs.readFileSync(NOTES_FILE) : null;
  const nextId = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  fs.writeFileSync(NOTES_FILE, JSON.stringify({ nextId, notes }, null, 2));
  try { return fn(); } finally {
    prev ? fs.writeFileSync(NOTES_FILE, prev) : fs.unlinkSync(NOTES_FILE);
  }
}

const notes = [
  { id: 1, text: "buy milk" },
  { id: 2, text: "call the bank" },
  { id: 3, text: "milk the almonds" },
];

test("search finds every note that contains the term", () => {
  const result = matches(notes, "milk");
  assert.strictEqual(result.length, 2);
});

test("search finds a single containing note", () => {
  const result = matches(notes, "bank");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 2);
});

test("search returns nothing when no note contains the term", () => {
  const result = matches(notes, "xyz");
  assert.strictEqual(result.length, 0);
});

test("edit updates the text of an existing note", () => {
  withCleanStore([{ id: 1, text: "original" }], () => {
    const updated = edit(1, "revised");
    assert.strictEqual(updated.id, 1);
    assert.strictEqual(updated.text, "revised");
  });
});

test("edit returns null when the note id does not exist", () => {
  withCleanStore([{ id: 1, text: "original" }], () => {
    const result = edit(999, "revised");
    assert.strictEqual(result, null);
  });
});
