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
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

module.exports = router