const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/jwt');
const { verifyGoogleIdToken } = require('./googleAuthService');

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const userCount = await User.countDocuments();
  // First user registered in the system becomes admin; subsequent users default to viewer
  const role = userCount === 0 ? 'admin' : 'viewer';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    authProvider: 'local'
  });

  const token = generateToken({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role
  });

  return { user: newUser, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.authProvider === 'google' && !user.passwordHash) {
    throw new AppError('Please log in using Google authentication', 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return { user, token };
};

const googleLogin = async ({ idToken }) => {
  const googleData = await verifyGoogleIdToken(idToken);
  let user = await User.findOne({ email: googleData.email });

  if (!user) {
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'viewer';

    user = await User.create({
      name: googleData.name,
      email: googleData.email,
      googleId: googleData.googleId,
      role,
      authProvider: 'google'
    });
  } else if (!user.googleId) {
    user.googleId = googleData.googleId;
    if (user.authProvider !== 'google') {
      user.authProvider = 'google';
    }
    await user.save();
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin
};
