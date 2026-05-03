const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
=======
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
>>>>>>> 4a883649 (patient management module added)
});
