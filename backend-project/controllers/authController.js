const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword } = req.body;
    const cleanFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanPassword = typeof password === 'string' ? password : '';
    const cleanConfirmPassword = typeof confirmPassword === 'string' ? confirmPassword : '';

    if (!cleanFullName || !cleanUsername || !cleanPassword || !cleanConfirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (cleanPassword !== cleanConfirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match' });
    }

    const exists = await User.findOne({ username: cleanUsername });
    if (exists) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    await User.create({
      fullName: cleanFullName,
      username: cleanUsername,
      password: hashedPassword,
      role: 'HR'
    });

    res.status(201).json({ message: 'Account created successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username: cleanUsername });
    if (!user) return res.status(404).json({ error: 'Account not found. Please create an account first.' });

    const match = await bcrypt.compare(cleanPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanPassword = typeof newPassword === 'string' ? newPassword : '';
    const cleanConfirmPassword = typeof confirmPassword === 'string' ? confirmPassword : '';

    if (!cleanUsername || !cleanPassword || !cleanConfirmPassword) {
      return res.status(400).json({ error: 'Username, new password and confirm password are required' });
    }
    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (cleanPassword !== cleanConfirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match' });
    }

    const user = await User.findOne({ username: cleanUsername });
    if (!user) return res.status(404).json({ error: 'Account not found' });

    user.password = await bcrypt.hash(cleanPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, resetPassword };
