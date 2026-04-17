const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "secret";

const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const tokenValue = token.split(" ")[1];

    const decodedData = jwt.verify(tokenValue, secret);

    req.user = decodedData;

    console.log("AuthMiddleware:", decodedData);

    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = validateToken;