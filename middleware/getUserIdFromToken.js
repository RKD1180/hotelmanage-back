const jwt = require("jsonwebtoken");

exports.getUserIdFromToken = async (req, res, next) => {
  // Get the token from the Authorization header

  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    if (token.startsWith("Bearer ")) {
      const exactToken = token.slice(7, token.length).trimLeft();
      const decoded = jwt.verify(exactToken, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      next();
    }
  } catch (error) {
    return res.json({ error: { message: "Token not found", status: 401 } });
  }
};
