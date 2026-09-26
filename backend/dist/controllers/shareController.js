import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Link } from '../models/Link.js';
import { Content } from '../models/Content.js';
import { User } from '../models/User.js';
import { random } from '../utils/helpers.js';
export const shareBrain = asyncHandler(async (req, res, next) => {
    const { share } = req.body;
    const userId = req.userId;
    if (!userId) {
        return next(new AppError('User authentication required', 401));
    }
    if (share) {
        const existingLink = await Link.findOne({ userId });
        if (existingLink) {
            res.status(200).json({
                success: true,
                hash: existingLink.hash,
                link: `/share/${existingLink.hash}`,
            });
            return;
        }
        const hash = random(10);
        await Link.create({ hash, userId });
        res.status(200).json({
            success: true,
            hash,
            link: `/share/${hash}`,
        });
    }
    else {
        await Link.deleteOne({ userId });
        res.status(200).json({
            success: true,
            message: 'Shared link removed successfully',
        });
    }
});
export const getSharedBrain = asyncHandler(async (req, res, next) => {
    const { sharelink } = req.params;
    const linkObj = await Link.findOne({ hash: sharelink });
    if (!linkObj) {
        return next(new AppError('Share link not found or expired', 404));
    }
    const user = await User.findById(linkObj.userId).select('username');
    if (!user) {
        return next(new AppError('Owner of this Second Brain no longer exists', 404));
    }
    const content = await Content.find({ userId: linkObj.userId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        username: user.username,
        contentCount: content.length,
        contents: content,
        content,
    });
});
