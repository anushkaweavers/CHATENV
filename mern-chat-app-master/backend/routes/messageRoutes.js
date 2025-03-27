const express = require("express");
const multer = require("multer");
const { allMessages, sendMessage } = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, upload.array("media"), sendMessage);

module.exports = router;
