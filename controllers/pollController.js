/**
 * -------------------------------------------------------------------
 * Author: Sasmithx
 * GitHub: https://github.com/sasmithx
 * Website: https://sasmithx.com
 * -------------------------------------------------------------------
 * Created: 2/15/2025 7:12 PM
 * Project: backend
 * -------------------------------------------------------------------
 */

const User = require('../models/User');
const Poll = require('../models/Poll');

//Create New Poll
exports.createPoll = async (req, res) => {
    const {question, type, options, creatorId} = req.body;

    if (!question || !type || !creatorId) {
        return res
            .status(400)
            .json({message: 'Question, Type and CreatorID are required '});
    }

    try {

        let processedOptions = [];
        switch (type) {
            case 'single-choice':
                if (!options || options.length < 2) {
                    return res
                        .status(400).json({
                            message: 'Single choice polls must have at least two options.',
                        });
                }
                processedOptions = options.map((option) => ({optionText: option}));
                break;

            case 'rating':
                processedOptions = [1, 2, 3, 4, 5].map((value) => ({
                    optionText: value.toString(),
                }));
                break;

            case 'yes/no':
                processedOptions = ["Yes", "No"].map((option) => ({
                    optionText: option,
                }));
                break;

            case 'image-based':
                if (!options || options.length < 2) {
                    return res
                        .status(400)
                        .json({
                            message: 'Image-based polls must have at least two image URLs.',
                        });
                }
                processedOptions = options.map((url) => ({optionText: url}));
                break;

            case 'open-ended':
                processedOptions = [];  //No options needed for open-ended polls.
                break;

            default:
                return res
                    .status(400)
                    .json({message: 'Invalid poll type.'});
        }

        const newPoll = await Poll.create({
            question,
            type,
            options: processedOptions,
            creator: creatorId,
        });

        return res
            .status(201)
            .json({newPoll});

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});

    }
}

// Get All Polls
exports.getAllPolls = async (req, res) => {
    const {type, creatorId, page = 1, limit = 10} = req.query;
    const filter = {};
    const userId = req.user._id;

    if (type) filter.type = type;
    if (creatorId) filter.creator = creatorId;

    try {
        // Calculate pagination parameters
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch polls with pagination
        const polls = await Poll.find(filter)
            .populate("creator", "fullName username email profileImageUrl")
            .populate({
                path: "responses.voterId",
                select: "username profileImageUrl fullName",
            })
            .skip(skip)
            .limit(pageSize)
            .sort({createdAt: -1});

        // Add `userHasVoted` flag to each poll
        const updatedPolls = polls.map((poll) => {
            const userHasVoted = poll.voters.some((voterId) =>
                voterId.equals(userId)
            );
            return {
                ...poll.toObject(),
                userHasVoted
            };
        });

        //Get total count of polls for pagination metadata
        const totalPolls = await Poll.countDocuments(filter);

        const stats = await Poll.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: {$sum: 1},
                },
            },
            {
                $project: {
                    type: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        //Ensure all types are included in stats, even those with zero counts

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
};

// Get All Voted Polls
exports.getVotedPolls = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Get Poll by ID
exports.getPollById = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Vote Poll
exports.voteOnPoll = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Close Poll
exports.closePoll = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Bookmark Poll
exports.bookmarkPoll = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Get All Bookmarked Polls
exports.getBookmarkedPolls = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Delete Poll
exports.deletePoll = async (req, res) => {
    try {

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}