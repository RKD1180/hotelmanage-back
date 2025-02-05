const express = require("express");

const {
  login,
  register,
  update,
  getUserById,
  getAllUsers,
  searchUsers,
} = require("../controllers/authController.js");
const { verifyToken } = require("../middleware/authMiddleWare.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", verifyToken, getAllUsers);
router.get("/user/:id", verifyToken, getUserById);
router.put("/update/:id", verifyToken, update);
router.get("/users/search", verifyToken, searchUsers);

module.exports = router;
