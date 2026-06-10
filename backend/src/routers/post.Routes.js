const express = require("express")
const protect = require("../middleware/authMiddleware")
const checkRole = require("../middleware/roleMiddleware")
const upload = require("../middleware/multer")

const {
    createPost,
    getAllPosts,
    getPostBySlug,
    deletePost,
    getCreatorPosts,
    updatePost,
    uploadImage,
} = require("../controllers/Post.Controller.js");

const router = express.Router();

router.get("/", getAllPosts);

router.get("/creator", protect, checkRole("creator"), getCreatorPosts);

// Route to handle cover image upload
router.post(
    "/upload",
    protect,
    checkRole("creator"),
    upload.single("image"),
    uploadImage
);

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