const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const client = new OAuth2Client(config.googleClientId);

const verifyGoogleIdToken = async (idToken) => {
  if (!idToken) {
    throw new AppError('Google ID token is required', 400);
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token payload', 401);
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Google authentication failed: ${error.message}`, 401);
  }
};

module.exports = {
  verifyGoogleIdToken
};
