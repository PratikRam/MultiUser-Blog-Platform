const Post = require("../models/post.model.js");
const slugify = require("../utils/slugify.js");

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

module.exports = {
    createPost,
    getAllPosts,
    getPostBySlug,
    deletePost,
};