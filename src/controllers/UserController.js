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

    // 🎯 BUILD ROLE-SPECIFIC EMAIL
    let emailSubject = "Welcome to PG Management";
    let emailBody = "";
    const userRole = String(req.body.role || "").toLowerCase();
    const loginURL = "http://localhost:5173/login";
    const websiteName = "PG Management Website";
    const contactNumber = "1234567890";
    const supportEmail = "support@pgmanagement.com";

    if (userRole === "tenant") {
      // 🧑‍💼 TENANT EMAIL
      emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .greeting strong { color: #667eea; }
            .welcome-text { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .features { margin: 30px 0; }
            .features h3 { color: #333; margin-top: 0; margin-bottom: 15px; }
            .features ul { list-style: none; padding: 0; margin: 0; }
            .features li { padding: 10px 0; padding-left: 30px; position: relative; }
            .features li:before { content: "✔"; position: absolute; left: 0; color: #28a745; font-weight: bold; font-size: 18px; }
            .divider { border-top: 2px dashed #667eea; margin: 30px 0; padding: 15px 0; text-align: center; font-weight: bold; color: #667eea; }
            .credentials { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0; }
            .credential-item { margin: 12px 0; display: flex; align-items: center; }
            .credential-label { font-weight: bold; color: #667eea; min-width: 120px; }
            .credential-value { color: #333; word-break: break-all; }
            .security-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .security-notice strong { color: #856404; }
            .footer-section { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            .footer-text { font-size: 14px; color: #666; margin: 10px 0; }
            .footer-item { margin: 8px 0; }
            .footer-label { font-weight: bold; color: #333; }
            .signature { margin-top: 30px; }
            .signature p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${websiteName} 🎉</h1>
              <p>Your PG Tenant Portal</p>
            </div>
            <div class="content">
              <div class="greeting">Dear <strong>${savedUser.fullName}</strong>,</div>
              
              <p>We are happy to have you as a part of our PG community.</p>
              
              <div class="welcome-text">
                Your tenant account has been successfully activated, and you can now access the portal to manage your stay conveniently.
              </div>

              <div class="features">
                <h3>Using your account, you can:</h3>
                <ul>
                  <li>Send maintenance or service requests</li>
                  <li>View room and PG details</li>
                  <li>Receive important updates and notifications</li>
                  <li>Communicate easily with the PG owner</li>
                </ul>
              </div>

              <div class="divider">━━━━━━━━━━━━━━━━━━━</div>

              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">📧 Login Email:</span>
                  <span class="credential-value">${savedUser.email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">🌐 Login Portal:</span>
                  <span class="credential-value"><a href="${loginURL}" style="color: #667eea; text-decoration: none;">${loginURL}</a></span>
                </div>
              </div>

              <div class="security-notice">
                <strong>🔒 Security Tip:</strong> We recommend keeping your login credentials secure and updating your password regularly for better security.
              </div>

              <p>If you need any assistance, feel free to contact the PG management team anytime.</p>

              <p>Thank you for choosing us.</p>

              <div class="signature">
                <p>Best Regards,</p>
                <p><strong>${websiteName} Team</strong></p>
                <div class="footer-item">📞 ${contactNumber}</div>
                <div class="footer-item">📧 ${supportEmail}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      emailSubject = `Welcome to ${websiteName} - Your Tenant Account is Ready!`;
    } else if (userRole === "owner") {
      // 🏠 OWNER EMAIL
      emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .greeting strong { color: #f5576c; }
            .welcome-text { background: #fff0f3; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 5px; }
            .features { margin: 30px 0; }
            .features h3 { color: #333; margin-top: 0; margin-bottom: 15px; }
            .features ul { list-style: none; padding: 0; margin: 0; }
            .features li { padding: 10px 0; padding-left: 30px; position: relative; }
            .features li:before { content: "✔"; position: absolute; left: 0; color: #28a745; font-weight: bold; font-size: 18px; }
            .divider { border-top: 2px dashed #f5576c; margin: 30px 0; padding: 15px 0; text-align: center; font-weight: bold; color: #f5576c; }
            .credentials { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin: 20px 0; }
            .credential-item { margin: 12px 0; display: flex; align-items: center; }
            .credential-label { font-weight: bold; color: #f5576c; min-width: 140px; }
            .credential-value { color: #333; word-break: break-all; }
            .highlight { background: #fffacd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
            .footer-section { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            .footer-text { font-size: 14px; color: #666; margin: 10px 0; }
            .footer-item { margin: 8px 0; }
            .footer-label { font-weight: bold; color: #333; }
            .signature { margin-top: 30px; }
            .signature p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${websiteName} 🚀</h1>
              <p>Your PG Owner Dashboard</p>
            </div>
            <div class="content">
              <div class="greeting">Dear <strong>${savedUser.fullName}</strong>,</div>
              
              <p>Your PG owner account has been successfully created and is ready to use.</p>
              
              <div class="welcome-text">
                Our platform is designed to help you manage your PG operations smoothly and efficiently. Start managing your property today!
              </div>

              <div class="features">
                <h3>With your owner dashboard, you can:</h3>
                <ul>
                  <li>Add and manage tenants</li>
                  <li>Track tenant requests and complaints</li>
                  <li>Manage room availability</li>
                  <li>Send notifications and updates</li>
                  <li>Maintain organized PG records</li>
                </ul>
              </div>

              <div class="divider">━━━━━━━━━━━━━━━━━━━</div>

              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">📧 Login Email:</span>
                  <span class="credential-value">${savedUser.email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">🌐 Dashboard Access:</span>
                  <span class="credential-value"><a href="${loginURL}" style="color: #f5576c; text-decoration: none;">${loginURL}</a></span>
                </div>
              </div>

              <div class="highlight">
                Thank you for using our PG Management System to simplify your property management experience. We are committed to providing you with a secure and user-friendly platform.
              </div>

              <p>If you require any support or have questions, our team is always here to help.</p>

              <div class="signature">
                <p>Best Regards,</p>
                <p><strong>${websiteName} Team</strong></p>
                <div class="footer-item">📞 ${contactNumber}</div>
                <div class="footer-item">📧 ${supportEmail}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      emailSubject = `Welcome to ${websiteName} - Your Owner Account is Ready!`;
    } else {
      // 🔧 DEFAULT EMAIL
      emailBody = `<p>Welcome to ${websiteName}!</p><p>Your account has been created successfully.</p>`;
    }

    // Send email
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

    // Payload used for the JWT should remain small.
    const tokenPayload = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      pgId: user.pgId,
      roomId: user.roomId,
      phone: user.phone,
      address: user.address,
      officeAddress: user.officeAddress,
      collegeAddress: user.collegeAddress,
    };

    const responseUser = {
      ...tokenPayload,
      profilePhoto: user.profilePhoto,
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn: "24h" });

    console.log('Login success for:', user.email); // Debug

    res.status(200).json({
      message: "Login successful",
      token,
      user: responseUser
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

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRoomId = currentUser?.roomId;
    const newRoomId = req.body.roomId;

    const updatedUser = await userSchema
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password");

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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await userSchema.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error changing password",
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

// ================= ADD TENANT BY OWNER =================
const addTenantByOwner = async (req, res) => {
  try {
    const { fullName, email, pgId } = req.body;

    if (!fullName || !email || !pgId) {
      return res.status(400).json({ 
        message: "Full name, email, and PG ID are required" 
      });
    }

    // Check if user already exists
    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }

    // Generate random password
    const generatedPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Get PG details
    const pgSchema = require("../models/PgModel");
    const pg = await pgSchema.findById(pgId).populate("ownerId", "fullName");

    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    // Create tenant
    const savedUser = await userSchema.create({
      fullName,
      email,
      password: hashedPassword,
      role: "tenant",
      pgId,
    });

    // Build HTML email template
    const loginURL = "http://localhost:5173/login";
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .divider { border-top: 2px dashed #667eea; margin: 20px 0; padding: 10px 0; text-align: center; font-weight: bold; color: #667eea; }
          .credentials { background: #f0f4ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #667eea; }
          .features { margin: 20px 0; }
          .features ul { list-style: none; padding: 0; }
          .features li { padding: 8px 0; padding-left: 25px; position: relative; }
          .features li:before { content: "✔"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
          .footer-item { margin: 5px 0; }
          .footer-label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${pg.pgName} 🎉</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${fullName}</strong>,</p>
            
            <p>Your tenant account has been successfully created by the PG owner.</p>
            
            <p>You can now log in to the tenant portal using the details below:</p>
            
            <div class="divider">📋 Login Credentials</div>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">📧 Email:</span> <strong>${email}</strong>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Temporary Password:</span> <strong>${generatedPassword}</strong>
              </div>
              <div class="credential-item">
                <span class="credential-label">🌐 Login URL:</span> <a href="${loginURL}" style="color: #667eea; text-decoration: none;"><strong>${loginURL}</strong></a>
              </div>
            </div>
            
            <p><strong>⚠️ Security Notice:</strong> For security reasons, we recommend changing your password after your first login.</p>
            
            <div class="features">
              <p><strong>Using your tenant account, you can:</strong></p>
              <ul>
                <li>View room and PG details</li>
                <li>Send maintenance or service requests</li>
                <li>Track request status</li>
                <li>Receive important notifications from the PG owner</li>
              </ul>
            </div>
            
            <p>If you face any issues while logging in, please contact the PG management.</p>
            
            <p>Thank you,<br><strong>${pg.pgName} / Management Team</strong></p>
            
            <div class="footer">
              <div class="footer-item">
                <span class="footer-label">📞 Contact Number:</span> ${pg.contactNumber || 'N/A'}
              </div>
              <div class="footer-item">
                <span class="footer-label">📧 Support Email:</span> support@pgmanagement.com
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    try {
      await mailSend(
        email,
        `Welcome to ${pg.pgName} - Your Tenant Account Credentials`,
        emailHTML
      );
    } catch (emailError) {
      console.log("Email notification failed but tenant created:", emailError.message);
      // Continue - don't fail the request
    }

    res.status(201).json({
      success: true,
      message: "Tenant added successfully and welcome email sent",
      data: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role,
        pgId: savedUser.pgId,
      },
    });
  } catch (err) {
    console.error("Error adding tenant by owner:", err);
    res.status(500).json({
      success: false,
      message: "Error adding tenant",
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
  changePassword,
  forgotPassword,
  resetPassword,
  addTenantByOwner, // 🎯 NEW
};