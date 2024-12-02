import User from "../models/UserModel.js";
import createToken from "../utils/jwt.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

export const signup = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        if(!email || !password) {
            return response.status(400).send("Please enter all fields");
        }

        const user = await User.create({email, password});
        response.cookie("jwt", createToken(email, user.id), {
            maxAge : 3 * 24 * 60 * 60 * 1000,       // 3 days
            secure : true,
            sameSite : "None"
        });

        return response.status(201).json({user : {
            id: user.id,
            email: user.email,
            profileSetups: user.profileSetups,
        }});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const login = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        if(!email || !password) {
            return response.status(400).send("Please enter all fields");
        }

        const user = await User.findOne({email});
        if(!user) {
            return response.status(400).send("User does not exist");
        }

        const auth = await compare(password, user.password);
        if(!auth) {
            return response.status(400).send("Invalid credentials");
        }

        response.cookie("jwt", createToken(email, user.id), {
            maxAge : 3 * 24 * 60 * 60 * 1000,       // 3 days
            secure : true,
            sameSite : "None"
        });

        return response.status(200).json({
            user : {
                id: user.id,
                email: user.email,
                profileSetups: user.profileSetups,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const getUserInfo = async (request, response, next) => {
    try {
        const userData = await User.findById(request.userId);
        if(!userData) {
            return response.status(404).send("User not found");
        }
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetups: userData.profileSetups,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const updateProfile = async (request, response, next) => {
    try {
        const { userId } = request;
        const { firstName, lastName, color } = request.body;
        if(!firstName || !lastName) {
            return response.status(400).send("FirstName, LastName are required");
        }
        const userData = await User.findByIdAndUpdate(userId, {firstName, lastName, color, profileSetups:true}, {new: true, runValidators: true});
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetups: userData.profileSetups,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const addProfileImage = async (request, response, next) => {
    try {
        if(!request.file) {
            return response.status(400).send("File is required.");
        }

        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(request.userId,
        {image: fileName},
        {new: true, runValidators: true}
        );

        return response.status(200).json({
            image : updatedUser.image,
        });
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const removeProfileImage = async (request, response, next) => {
    try {
        const { userId } = request;
        const user = await User.findById(userId);

        if(!user) {
            return response.status(404).send("User not found");
        }
        
        if(user.image) {
            unlinkSync(user.image);
        }

        user.image = null;  
        await user.save();

        return response.status(200).send("Profile image removed successfully");
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const logout = async (request, response, next) => {
    try {
        response.cookie("jwt", "", {maxAge : 1, secure : true, sameSite : "None"});
        return response.status(200).send("Logged out successfully");
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};
