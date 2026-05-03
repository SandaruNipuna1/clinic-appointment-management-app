const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(
    {
<<<<<<< HEAD
      id: user._id.toString(),
=======
      id: user.id,
>>>>>>> 4a883649 (patient management module added)
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

module.exports = generateToken;
