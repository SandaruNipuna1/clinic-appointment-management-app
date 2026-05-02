const crypto = require("crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `${salt}:${derivedKey}`;
};

const verifyPassword = (password, storedPasswordHash) => {
  const [salt, originalKey] = storedPasswordHash.split(":");

  if (!salt || !originalKey) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  const originalKeyBuffer = Buffer.from(originalKey, "hex");
  const derivedKeyBuffer = Buffer.from(derivedKey, "hex");

  if (originalKeyBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalKeyBuffer, derivedKeyBuffer);
};

module.exports = {
  hashPassword,
  verifyPassword
};
