import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";

export const searchContacts = async (request, response, next) => {
    try {
        const {searchTerm} = request.body;
        if(searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("Search Term is required");
        }

        const regexTerm = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        
        const regex = new RegExp(regexTerm, "i");

        const contacts = await User.find({
            $and: [
                { _id : { $ne: request.userId } },
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ],          // if id!=userId then only show     ;    contains all contacts
        });

        return response.status(200).json({contacts});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const getContactsForDMList = async (request, response, next) => {
    try {
        let { userId } = request;
        
        userId = new mongoose.Types.ObjectId(userId);
        
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                }
            },
            {
                $unwind: "$contactInfo",        // to get contactInfo as object because it is an array
            },
            {
                $project: {         // get actual fields from contactInfo
                    _id: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    image: "$contactInfo.image",
                    color: "$contactInfo.color",
                },
            },
            {
                $sort: { lastMessageTime: -1 },
            }
        ]);

        return response.status(200).json({contacts});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

export const getAllContacts = async (request, response, next) => {
    try {
        const users = await User.find(
            { _id: { $ne: request.userId } }, 
            "firstName lastName _id email"
        );

        const contacts = users.map((user) => ({
            label : user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
        }));

        // console.log(contacts);
        
        return response.status(200).json({contacts});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};
