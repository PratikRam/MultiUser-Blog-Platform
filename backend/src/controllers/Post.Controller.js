const Post = require("../models/post.model.js");
const slugify = require("../utils/slugify.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js");


const createPost = async (req, res) => {
    try {
        const {
            title,
            htmlContent,
            category,
            coverImage,
            excerpt,
            seoKeywords,
            status,
        } = req.body;

        const slug = slugify(title);

        const existingSlug = await Post.findOne({ slug });

        if (existingSlug) {
            return res.status(400).json({
                message: "Slug already exists",
            });
        }

        const post = await Post.create({
            title,
            slug,
            htmlContent,
            category,
            coverImage,
            excerpt,
            seoKeywords,
            status,
            authorId: req.user._id,
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            status: "PUBLISHED",
        })
            .populate("authorId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({
            slug: req.params.slug,
        }).populate("authorId", "name");

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        if (
            post.authorId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getCreatorPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            authorId: req.user._id,
        })
            .populate("authorId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        if (post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        const {
            title,
            htmlContent,
            category,
            coverImage,
            excerpt,
            seoKeywords,
            status,
        } = req.body;

        if (title && title !== post.title) {
            const slug = slugify(title);
            const existingSlug = await Post.findOne({ slug });
            if (existingSlug && existingSlug._id.toString() !== post._id.toString()) {
                return res.status(400).json({
                    message: "Slug already exists for this title",
                });
            }
            post.title = title;
            post.slug = slug;
        }

        if (htmlContent !== undefined) post.htmlContent = htmlContent;
        if (category !== undefined) post.category = category;
        if (coverImage !== undefined) post.coverImage = coverImage;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (seoKeywords !== undefined) post.seoKeywords = seoKeywords;
        if (status !== undefined) post.status = status;

        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const uploadImage = async (req, res) => {   
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image file provided",
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);
        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to upload image to Cloudinary",
            error: error.message,
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostBySlug,
    deletePost,
    getCreatorPosts,
    updatePost,
    uploadImage,
};