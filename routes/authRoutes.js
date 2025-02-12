/**
 * -------------------------------------------------------------------
 * Author: Sasmithx
 * GitHub: https://github.com/sasmithx
 * Website: https://sasmithx.com
 * -------------------------------------------------------------------
 * Created: 2/12/2025 12:43 PM
 * Project: VanguardVote-BACKEND
 * -------------------------------------------------------------------
 */

const express = require('express');
const {
    registerUser,
    loginUser,
    getUserInfo
} = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect , getUserInfo);

module.exports = router