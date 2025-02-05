const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

// Generate Access & Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short expiry for security
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Longer expiry for refresh tokens
  );

  return { accessToken, refreshToken };
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Check if the username or email is already in use
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        error: { message: "Username or Email already in use.", status: 400 },
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "user", // Default role is 'user'
    });

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(newUser);
    newUser.refreshToken = refreshToken; // Store refresh token in DB

    // Save user to database
    const savedUser = await newUser.save();

    // Format the response without sensitive data
    const userData = {
      _id: savedUser._id,
      name: savedUser.name,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      accessToken,
      refreshToken,
    };

    return res.status(201).json({ user: userData, status: 201 });
  } catch (error) {
    return res.status(500).json({
      error: { message: error.message, status: 500 },
    });
  }
};

// Login Functionality
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: { message: "User not found.", status: 404 },
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: { message: "Invalid credentials.", status: 401 },
      });
    }

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Format response
    const userData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };

    return res.status(200).json({ user: userData, status: 200 });
  } catch (error) {
    return res.status(500).json({
      error: { message: error.message, status: 500 },
    });
  }
};

// Refresh Token Functionality
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(403)
        .json({ error: { message: "Refresh token required.", status: 403 } });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res
        .status(403)
        .json({ error: { message: "Invalid refresh token.", status: 403 } });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ error: { message: "Invalid token.", status: 403 } });

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);
      user.refreshToken = newRefreshToken;
      user.save();

      return res
        .status(200)
        .json({ accessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Update User
exports.update = async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating password directly without hashing
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(user, updateData);

    await user.save();

    res.json({ message: "User updated successfully", user, status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user, status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    if (!users.length) {
      return res
        .status(404)
        .json({ error: { message: "No users found.", status: 404 } });
    }

    return res.status(200).json({ users, status: 200 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: error.message, status: 500 } });
  }
};

// Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("-password -refreshToken");

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users, status: 200 });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
