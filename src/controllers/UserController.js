const userSchema = require("../models/UserModel");
const roomSchema = require("../models/RoomModel");
const bcrypt = require("bcrypt");
const mailSend = require("../utils/MailUtil");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const secret = process.env.JWT_SECRET || "secret";

// ================= ROOM OCCUPANCY HELPER =================
const updateRoomOccupancy = async (roomId, increment = true) => {
  if (!roomId) return;

  try {
    const room = await roomSchema.findById(roomId);
    if (!room) return;

    const currentOccupied = room.occupiedBeds || 0;
    const newOccupied = increment ? currentOccupied + 1 : currentOccupied - 1;

    const validOccupied = Math.max(0, Math.min(newOccupied, room.totalBeds));

    await roomSchema.findByIdAndUpdate(roomId, {
      occupiedBeds: validOccupied,
    });
  } catch (error) {
    console.error("Error updating room occupancy:", error);
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    let password = req.body.password;
    let isGeneratedPassword = false;

    if (!password) {
      password = crypto.randomBytes(8).toString("hex");
      isGeneratedPassword = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const savedUser = await userSchema.create({
      ...req.body,
      password: hashedPassword,
    });

    if (req.body.roomId) {
      await updateRoomOccupancy(req.body.roomId, true);
    }

    const emailSubject = "Welcome to our Website";
    const emailBody = isGeneratedPassword
      ? `Your temporary password is: ${password}`
      : "Thank you for registering";

    // await mailSend(savedUser.email, emailSubject, emailBody);
    try {
      await mailSend(savedUser.email, emailSubject, emailBody);
    } catch (emailError) {
      console.log("Email failed but user created:", emailError.message);
      // ❌ DO NOT RETURN ERROR
    }

    res.status(201).json({
      message: "User created",
      data: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while creating user",
      error: err.message,
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email); // Debug log

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await userSchema.findOne({ email }).select('+password');

    console.log('User found:', user ? user.email : 'not found'); // Debug

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "User password not set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log('Password match:', isMatch); // Debug

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Payload without password
    const userPayload = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      pgId: user.pgId,
      roomId: user.roomId,
      phone: user.phone,
      address: user.address
    };

    const token = jwt.sign(userPayload, secret, { expiresIn: "24h" });

    console.log('Login success for:', user.email); // Debug

    res.status(200).json({
      message: "Login successful",
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err); // Server log for debug
    res.status(500).json({
      message: "Login server error",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ================= GET ALL USERS =================
const getUser = async (req, res) => {
  try {
    const users = await userSchema.find().select("-password");

    res.status(200).json({
      message: "Users fetched",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
};

// ================= GET USER BY ID (🔥 FIX) =================
const getUserById = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // IMPORTANT: direct object (matches your frontend)
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user",
      error: err.message,
    });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const currentUser = await userSchema.findById(req.params.id);

    const oldRoomId = currentUser?.roomId;
    const newRoomId = req.body.roomId;

    const updatedUser = await userSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (oldRoomId !== newRoomId) {
      if (oldRoomId) await updateRoomOccupancy(oldRoomId, false);
      if (newRoomId) await updateRoomOccupancy(newRoomId, true);
    }

    res.status(200).json({
      message: "User updated",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating user",
      error: err.message,
    });
  }
};

// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);

    await userSchema.findByIdAndDelete(req.params.id);

    if (user?.roomId) {
      await updateRoomOccupancy(user.roomId, false);
    }

    res.status(200).json({
      message: "User deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting user",
      error: err.message,
    });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const user = await userSchema.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign(user.toObject(), secret, { expiresIn: "7d" });

  const url = `http://localhost:5173/resetpassword/${token}`;

  await mailSend(
    user.email,
    "Reset Password",
    `<a href="${url}">Click to reset password</a>`
  );

  res.status(200).json({
    message: "Reset link sent",
  });
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    const decoded = jwt.verify(token, secret);

    const hashedPassword = await bcrypt.hash(password, 10);

    await userSchema.findByIdAndUpdate(decoded._id, {
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUserById, // 🔥 IMPORTANT
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
};