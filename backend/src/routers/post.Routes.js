const express = require("express")
const protect = require("../middleware/authMiddleware")
const checkRole = require("../middleware/roleMiddleware")

const {
    createPost,
    getAllPosts,
    getPostBySlug,
    deletePost,
} = require("../controllers/Post.Controller.js");

const router = express.Router();

router.get("/", getAllPosts);

router.get("/:slug", getPostBySlug);

router.post(
    "/",
    protect,
    checkRole("creator"),
    createPost
);

router.delete(
    "/:id",
    protect,
    checkRole("CREATOR"),
    deletePost
);

module.exports = router;