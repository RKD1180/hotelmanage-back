const Hotel = require("../models/Hotel");

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    const {
      name,
      address,
      costPerNight,
      availableRooms,
      image,
      averageRating,
      userId,
    } = req.body;

    // Ensure all required fields are provided
    if (
      !name ||
      !address ||
      !costPerNight ||
      !availableRooms ||
      !image ||
      !userId
    ) {
      return res.status(400).json({
        error: { message: "Missing required fields", status: 400 },
      });
    }

    const newHotel = new Hotel({
      name,
      address,
      costPerNight,
      availableRooms,
      image,
      averageRating, // Optional
      userId, // Should be the ID of an existing user
    });

    const savedHotel = await newHotel.save();
    return res
      .status(201)
      .json({
        hotel: savedHotel,
        status: 200,
        message: "Hotel created successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Get a hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "userId",
      "name email"
    ); // Populate user details if needed
    if (!hotel) {
      return res
        .status(404)
        .json({ error: { message: "Hotel not found", status: 404 } });
    }
    return res.status(200).json({ hotel, status: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Get all hotels with pagination
exports.getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const hotels = await Hotel.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Hotel.countDocuments();
    return res.status(200).json({
      hotels,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit: limit,
      status: 200,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Update hotel details
exports.updateHotel = async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedHotel) {
      return res
        .status(404)
        .json({ error: { message: "Hotel not found", status: 404 } });
    }

    return res.status(200).json({ hotel: updatedHotel, status: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Delete a hotel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res
        .status(404)
        .json({ error: { message: "Hotel not found", status: 404 } });
    }

    return res
      .status(200)
      .json({ message: "Hotel deleted successfully", status: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Search hotels by name, address, or image
exports.searchHotels = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: { message: "Query parameter is required", status: 400 },
      });
    }

    const hotels = await Hotel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
        { image: { $regex: query, $options: "i" } },
      ],
    });

    if (hotels.length === 0) {
      return res
        .status(404)
        .json({ error: { message: "No hotels found", status: 404 } });
    }

    return res.status(200).json({ hotels, status: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};
