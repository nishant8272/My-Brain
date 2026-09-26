import { Content } from '../models/Content.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { upsertDocumentVectors, deleteDocumentVector } from '../services/pineconeService.js';
export const createContent = asyncHandler(async (req, res, next) => {
    const { title, text, link, type = 'document', tags = [] } = req.body;
    const userId = req.userId;
    if (!userId) {
        return next(new AppError('User authentication required', 401));
    }
    const validTypes = ['youtube', 'twitter', 'document', 'link', 'image', 'video', 'article', 'audio'];
    if (!validTypes.includes(type)) {
        return next(new AppError(`Invalid content type '${type}'`, 400));
    }
    const cleanTags = Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];
    const newContent = await Content.create({
        userId,
        title: title || 'Untitled',
        text: text || title || 'Saved item',
        link: link || '',
        type,
        tags: cleanTags,
    });
    // Background vector upsert to Pinecone
    upsertDocumentVectors(newContent);
    res.status(201).json({
        success: true,
        message: 'Content created successfully',
        content: newContent,
    });
});
export const getContents = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const { type, tag, search, favorite } = req.query;
    const filter = { userId };
    if (type && type !== 'all') {
        filter.type = type;
    }
    if (tag) {
        filter.tags = tag.toLowerCase();
    }
    if (favorite === 'true') {
        filter.isFavorite = true;
    }
    if (search) {
        const q = search.trim();
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { text: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
        ];
    }
    const contents = await Content.find(filter).sort({ isFavorite: -1, createdAt: -1 });
    res.status(200).json({
        success: true,
        contents,
    });
});
export const updateContent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.userId;
    const { title, text, link, type, tags, isFavorite } = req.body;
    const content = await Content.findOne({ _id: id, userId });
    if (!content) {
        return next(new AppError('Content not found or unauthorized', 404));
    }
    if (title !== undefined)
        content.title = title;
    if (text !== undefined)
        content.text = text;
    if (link !== undefined)
        content.link = link;
    if (type !== undefined)
        content.type = type;
    if (isFavorite !== undefined)
        content.isFavorite = Boolean(isFavorite);
    if (Array.isArray(tags)) {
        content.tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    await content.save();
    // Update vectors in Pinecone
    upsertDocumentVectors(content);
    res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        content,
    });
});
export const toggleFavorite = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.userId;
    const content = await Content.findOne({ _id: id, userId });
    if (!content) {
        return next(new AppError('Content not found', 404));
    }
    content.isFavorite = !content.isFavorite;
    await content.save();
    res.status(200).json({
        success: true,
        message: content.isFavorite ? 'Content pinned to favorites' : 'Content unpinned from favorites',
        content,
    });
});
export const deleteContent = asyncHandler(async (req, res, next) => {
    const id = req.params.id || req.body.id;
    const userId = req.userId;
    if (!id || !userId) {
        return next(new AppError('Content ID is required', 400));
    }
    const result = await Content.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
        return next(new AppError('Content not found or unauthorized to delete', 404));
    }
    deleteDocumentVector(id, userId);
    res.status(200).json({
        success: true,
        message: 'Content deleted successfully',
    });
});
export const batchDeleteContent = asyncHandler(async (req, res, next) => {
    const { ids } = req.body;
    const userId = req.userId;
    if (!Array.isArray(ids) || !ids.length || !userId) {
        return next(new AppError('Array of content IDs is required', 400));
    }
    await Content.deleteMany({ _id: { $in: ids }, userId });
    for (const id of ids) {
        deleteDocumentVector(id, userId);
    }
    res.status(200).json({
        success: true,
        message: `Deleted ${ids.length} content items`,
    });
});
export const getContentStats = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const allContents = await Content.find({ userId });
    const counts = {
        all: allContents.length,
        youtube: 0,
        twitter: 0,
        document: 0,
        link: 0,
        image: 0,
        video: 0,
        article: 0,
        audio: 0,
        favorites: 0,
    };
    const tagSet = new Set();
    allContents.forEach(item => {
        if (item.type && counts[item.type] !== undefined) {
            counts[item.type]++;
        }
        if (item.isFavorite) {
            counts.favorites++;
        }
        if (Array.isArray(item.tags)) {
            item.tags.forEach(t => tagSet.add(t));
        }
    });
    res.status(200).json({
        success: true,
        counts,
        tags: Array.from(tagSet),
    });
});
