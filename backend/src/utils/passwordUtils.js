const crypto = require("crypto");

// Salt length in bytes for password hashing
const SALT_LENGTH = 16;
// Output key length in bytes for the scrypt hash
const KEY_LENGTH = 64;

// Turn a plain password into a secure hash string we can store safely
const hashPassword = (password) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  // Store the salt together with the hash so we can verify later
  return `${salt}:${derivedKey}`;
};

// Check a login password against the stored password hash
const verifyPassword = (password, storedPasswordHash) => {
  const [salt, originalKey] = storedPasswordHash.split(":");

  if (!salt || !originalKey) {
    return false;
  }

  // Recreate the hash using the same salt and compare it
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  const originalKeyBuffer = Buffer.from(originalKey, "hex");
  const derivedKeyBuffer = Buffer.from(derivedKey, "hex");

  if (originalKeyBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  // Use a safe compare to avoid timing attacks
  return crypto.timingSafeEqual(originalKeyBuffer, derivedKeyBuffer);
};

module.exports = {
  hashPassword,
  verifyPassword
};
