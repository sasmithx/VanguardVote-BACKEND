/**
 * -------------------------------------------------------------------
 * Author: Sasmithx
 * GitHub: https://github.com/sasmithx
 * Website: https://sasmithx.com
 * -------------------------------------------------------------------
 * Created: 2/15/2025 7:11 PM
 * Project: backend
 * -------------------------------------------------------------------
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createPoll,
    getAllPolls,
    getVotedPolls,
    getPollById,
    voteOnPoll,
    closePoll,
    bookmarkPoll,
    getBookmarkedPolls,
    deletePoll
} = require('../controllers/pollController');

const router = express.Router();

router.post("/create", protect, createPoll);
router.get("/getAllPolls", protect, getAllPolls);
router.get("/votedPolls", protect, getVotedPolls);
router.get("/:id", protect, getPollById);
router.post("/:id/vote", protect, voteOnPoll);
router.post("/:id/close", protect, closePoll);
router.post("/:id/bookmark", protect, bookmarkPoll);
router.get("/user/bookmarked", protect, getBookmarkedPolls);
router.delete("/:id/delete", protect, deletePoll);

module.exports = router;

