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
        const allTypes = [
            {type: "single-choice", label: "Single Choice"},
            {type: "yes/no", label: "YES/NO"},
            {type: "rating", label: "Rating"},
            {type: "image-based", label: "Image Based"},
            {type: "open-ended", label: "Open Ended"},
        ];
        const statsWithDefaults = allTypes
            .map((pollType) => {
                const stat = stats.find((item) => item.type === pollType.type);
                return {
                    label: pollType.label,
                    type: pollType.type,
                    count: stat ? stat.count : 0,
                };
            })
            .sort((a, b) => b.count - a.count);

        res.status(200).json({
            polls: updatedPolls,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalPolls / pageSize),
            totalPolls,
            stats: statsWithDefaults,
        });
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
};

// Get All Voted Polls
exports.getVotedPolls = async (req, res) => {
    const {page = 1, limit = 10} = req.query;
    const userId = req.user._id;

    try {
        // Calculate pagination parameters
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch polls where the user has voted
        const polls = await Poll.find({voters: userId}) // Filter by polls where the user's ID exists in the voters array
            .populate("creator", "fullName profileImageUrl username email")
            .populate({
                path: "responses.voterId",
                select: "username profileImageUrl fullName",
            })
            .skip(skip)
            .limit(pageSize);

        //Add `userHasVoted` flag for each poll
        const updatedPolls = polls.map((poll) => {
            const userHasVoted = poll.voters.some((voterId) =>
                voterId.equals(userId)
            );
            return {
                ...poll.toObject(),
                userHasVoted,
            };
        });

        // Get total count of voted polls for pagination metadata
        const totalVotedPolls = await Poll.countDocuments({voters: userId});

        res.status(200).json({
            polls: updatedPolls,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalVotedPolls / pageSize),
            totalVotedPolls,
        });
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error', error: err.message});
    }
}

// Get Poll by ID
exports.getPollById = async (req, res) => {
    const {id} = req.params;

    try {
        const poll = await Poll.findById(id)
            .populate("creator", "username email")
            .populate({
            path: "responses.voterId",
            select: "username profileImageUrl fullName",
        });
        if (!poll) {
            return res.status(404).json({message: "Poll not found."});
        }

        res.status(200).json(poll);
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error', err: err.message});
    }
}

// Vote Poll
exports.voteOnPoll = async (req, res) => {
    const {id} = req.params;
    const {optionIndex, voterId, responseText} = req.body;

    try {
        const poll = await Poll.findById(id);
        if (!poll) {
            return res.status(404).json({message: "Poll not found."});
        }

        if (poll.closed) {
            return res.status(400).json({message: "This poll is closed."});
        }

        if (poll.voters.includes(voterId)) {
            return res.status(400).json({message: "You have already voted on this poll."});
        }

        if (poll.type === "open-ended") {
            if (!responseText || responseText.trim() === "") {
                return res.status(400).json({message: "Response text is required for open-ended polls."});
            }
            poll.responses.push({voterId, responseText});
        } else {
            if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex >= poll.options.length) {
                return res.status(400).json({message: "Invalid option index."});
            }
            poll.options[optionIndex].votes += 1;
        }

        poll.voters.push(voterId);
        await poll.save();

        return res.status(200).json(poll);
    } catch (err) {
        return res.status(500).json({message: 'Internal server error', error: err.message});
    }
};

// Close Poll
exports.closePoll = async (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    try {
        const poll = await Poll.findById(id);

        if (!poll) {
            return res.status(404).json({message: "Poll not found."});
        }

        if (poll.creator.toString() !== userId) {
            return res
                .status(403)
                .json({message: "You are not authorized to close this poll."});
        }

        poll.closed = true;
        await poll.save();

        res.status(200).json({message: "Poll closed successfully.", poll});
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Bookmark Poll
exports.bookmarkPoll = async (req, res) => {
    const {id} = req.params; // Poll ID
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }
        // Check if poll is already bookmarked
        const isBookmarked = user.bookmarkedPolls.includes(id);

        if (isBookmarked) {
            // Remove poll from bookmarks
            user.bookmarkedPolls = user.bookmarkedPolls.filter(
                (pollId) => pollId.toString() !== id
            );

            await user.save();
            return res.status(200).json({
                message: "Poll removed from bookmarks.",
                bookmarkedPolls: user.bookmarkedPolls,
            });
        }

        //Add poll to bookmarks
        user.bookmarkedPolls.push(id);
        await user.save();
        res.status(200).json({
            message: "Poll bookmarked successfully.",
            bookmarkedPolls: user.bookmarkedPolls,
        });

    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Get All Bookmarked Polls
exports.getBookmarkedPolls = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate({
            path: "bookmarkedPolls",
            populate: {
                path: "creator",
                select: "fullName username profileImageUrl",
            },
        });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const bookmarkedPolls = user.bookmarkedPolls;
      // Add `userHasVoted` flag to each poll
      const updatedPolls = bookmarkedPolls.map((poll) => {
          const userHasVoted = poll.voters.some((voterId) =>
              voterId.equals(userId)
          );
          return {
              ...poll.toObject(),
              userHasVoted,
          };
      });

      res.status(200).json({ bookmarkedPolls: updatedPolls });
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}

// Delete Poll
exports.deletePoll = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const poll = await Poll.findById(id);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found."});
        }

        if (poll.creator.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "You are not authorized to delete this poll."});
        }

        await Poll.findByIdAndDelete(id);

        res.status(200).json({ message: "Poll deleted successfully."});
    } catch (err) {
        res
            .status(500)
            .json({message: 'Internal server error'});
    }
}