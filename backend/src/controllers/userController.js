const User = require('../models/User');
const AppError = require('../utils/AppError');

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    if (req.user._id.toString() === id && role !== 'admin') {
      return next(new AppError('You cannot revoke your own admin role', 400));
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role updated successfully to '${role}'`,
      data: {
        user: targetUser
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserRole
};
