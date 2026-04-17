const crypto = require("crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const HASH_ALGORITHM = "sha512";

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

  return crypto.timingSafeEqual(Buffer.from(originalKey, "hex"), Buffer.from(derivedKey, "hex"));
};

module.exports = {
  hashPassword,
  verifyPassword
};
