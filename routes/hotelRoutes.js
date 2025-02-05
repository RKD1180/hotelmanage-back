const express = require("express");
const hotelController = require("../controllers/hotelController");
const { verifyToken } = require("../middleware/authMiddleWare");

const router = express.Router();

router.post("/", verifyToken, hotelController.createHotel);
router.get("/:id", hotelController.getHotelById);
router.get("/", hotelController.getAllHotels);
router.put("/:id", verifyToken, hotelController.updateHotel);
router.delete("/:id", verifyToken, hotelController.deleteHotel);
router.get("/search", hotelController.searchHotels);

module.exports = router;
