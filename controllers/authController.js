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

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1h"});
};

//Register User
exports.registerUser = async (req, res) => {
    const {fullName, username, email, password, profileImageUrl} = req.body;

    //Validation: Check for missing fields
    if (!fullName || !username || !email || !password) {
        return res.status(400).json({error: "Please fill in all fields"});
    }

    //Validation: Check username format
    //Allows alphanumeric characters and hyphens only
    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({
            message:
                "Invalid username. Username can only contain alphanumeric characters and hyphens.",
        });
    }

    try {
        //Check if email already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "Email already exists"});
        }

        //Check if username already exists
        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res
                .status(400)
                .json({message: "Username already exists"});
        }

        //Create the user
        const user = await User.create({
            fullName,
            username,
            email,
            password,
            profileImageUrl,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({message: "Error registering user", error: error.message});
    }
}