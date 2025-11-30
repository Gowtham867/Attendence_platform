const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, employeeId, email, password, role, department } = req.body;

    // Check if exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = await User.create({
      name,
      employeeId,
      email,
      password,
      role,
      department,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      employeeId: newUser.employeeId,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// Get logged in user
exports.getMe = async (req, res, next) => {
  try {
    res.json(req.user); // added by protect middleware
  } catch (error) {
    next(error);
  }
};
