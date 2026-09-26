import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const signup = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    const userIdentifier = (username || email || '').trim();
    const userEmail = (email || (username && username.includes('@') ? username : '')).trim();
    if (!userIdentifier || !password) {
        return next(new AppError('Please provide username/email and password', 400));
    }
    if (password.length < 4) {
        return next(new AppError('Password must be at least 4 characters long', 400));
    }
    const existingUser = await User.findOne({
        $or: [{ username: userIdentifier }, ...(userEmail ? [{ email: userEmail }] : [])],
    });
    if (existingUser) {
        return next(new AppError('User already exists with this username or email', 409));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username: userIdentifier,
        ...(userEmail ? { email: userEmail } : {}),
        passwordHash: hashedPassword,
    });
    const secret = process.env.JWT_SECRET || 'fallbacksecret';
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '30d' });
    res.status(201).json({
        success: true,
        message: 'User signed up successfully!',
        token,
        user: { id: user._id, username: user.username, email: user.email },
    });
});
export const signin = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    const identifier = (username || email || '').trim();
    if (!identifier || !password) {
        return next(new AppError('Please provide username/email and password', 400));
    }
    const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
        return next(new AppError('Invalid credentials or user does not exist', 401));
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
        return next(new AppError('Invalid credentials', 401));
    }
    const secret = process.env.JWT_SECRET || 'fallbacksecret';
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '30d' });
    res.status(200).json({
        success: true,
        message: 'User signed in successfully!',
        token,
        user: { id: user._id, username: user.username, email: user.email },
    });
});
export const getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        success: true,
        user: { id: user._id, username: user.username, createdAt: user.createdAt },
    });
});
