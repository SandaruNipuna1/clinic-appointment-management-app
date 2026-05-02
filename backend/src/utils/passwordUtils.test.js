const assert = require("node:assert/strict");
const test = require("node:test");

const { hashPassword, verifyPassword } = require("./passwordUtils");

test("hashPassword stores a salted password hash", () => {
  const hash = hashPassword("secret123");

  assert.notEqual(hash, "secret123");
  assert.match(hash, /^[a-f0-9]+:[a-f0-9]+$/);
});

test("verifyPassword accepts the correct password and rejects the wrong password", () => {
  const hash = hashPassword("secret123");

  assert.equal(verifyPassword("secret123", hash), true);
  assert.equal(verifyPassword("wrong-password", hash), false);
});

test("verifyPassword rejects malformed stored hashes", () => {
  assert.equal(verifyPassword("secret123", ""), false);
  assert.equal(verifyPassword("secret123", "abc:def"), false);
});
