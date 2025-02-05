const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
      return res
        .status(403)
        .json({ error: { message: "Access Denied", status: 403 } });
    }

    token = token.slice(7).trim();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
        return next(); // Access token is valid
      }

      if (err.name === "TokenExpiredError") {
        const refreshToken = req.header("x-refresh-token"); // Refresh token sent in header

        if (!refreshToken) {
          return res.status(401).json({
            error: { message: "Token expired, login again", status: 401 },
          });
        }

        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (refreshErr, refreshDecoded) => {
            if (refreshErr) {
              return res.status(403).json({
                error: { message: "Invalid refresh token", status: 403 },
              });
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.JWT_SECRET,
              { expiresIn: "15m" }
            );

            res.setHeader("x-access-token", newAccessToken); // Send new access token in response header
            req.user = refreshDecoded;
            next();
          }
        );
      } else {
        return res
          .status(401)
          .json({ error: { message: "Invalid token", status: 401 } });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: { message: "Internal Server Error", status: 500 } });
  }
};
