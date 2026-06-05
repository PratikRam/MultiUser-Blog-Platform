const express = require("express")
const protect = require("../middleware/authMiddleware")
const checkRole = require("../middleware/roleMiddleware")

const {
    createPost,
    getAllPosts,
    getPostBySlug,
    deletePost,
    getCreatorPosts,
    updatePost,
} = require("../controllers/Post.Controller.js");

const router = express.Router();

router.get("/", getAllPosts);

router.get("/creator", protect, checkRole("creator"), getCreatorPosts);

router.get("/:slug", getPostBySlug);

router.post(
    "/",
    protect,
    checkRole("creator"),
    createPost
);

router.put(
    "/:id",
    protect,
    checkRole("creator"),
    updatePost
);

router.delete(
    "/:id",
    protect,
    checkRole("CREATOR"),
    deletePost
);

module.exports = router;