import Message from "../models/MessagesModel.js"
import { mkdirSync, renameSync } from 'fs';

export const getMessages = async (request, response, next) => {
    try {
        const user1 = request.userId;
        const user2 = request.body.id;

        if(!user1 || !user2) {
            return response.status(400).send("Both users are not present");
        }

        const messages = await Message.find({
            $or: [
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1}
            ],
        }).sort({timestamp: 1});
        
        return response.status(200).json({messages});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};

// export const getMessages = async (request, response, next) => {
//     try {
//         const user1 = request.userId;
//         const user2 = request.body.id;
//         const page = parseInt(request.body.page) || 1; // Default to page 1
//         const limit = parseInt(request.body.limit) || 20; // Default to 20 messages per page

//         if (!user1 || !user2) {
//             return response.status(400).send("Both users are not present");
//         }

//         // Calculate the number of messages to skip
//         const skip = (page - 1) * limit;

//         // Fetch messages with pagination
//         const messages = await Message.find({
//             $or: [
//                 { sender: user1, recipient: user2 },
//                 { sender: user2, recipient: user1 }
//             ],
//         })
//         .sort({ timestamp: 1 }) // Sort messages by timestamp in ascending order
//         .skip(skip) // Skip the messages for previous pages
//         .limit(limit); // Limit the number of messages fetched

//         // Check if there are more messages to load
//         const totalMessages = await Message.countDocuments({
//             $or: [
//                 { sender: user1, recipient: user2 },
//                 { sender: user2, recipient: user1 }
//             ],
//         });

//         const hasMore = skip + messages.length < totalMessages;

//         return response.status(200).json({
//             messages,
//             hasMore,
//             totalMessages,
//         });
//     } catch (error) {
//         console.log(error.message);
//         return response.status(500).send("Internal Server Error Occurred");
//     }
// };


export const uploadFile = async (request, response, next) => {
    try {
        if(!request.file) {
            return response.status(400).send("File is required");
        }
        
        const date = Date.now();
        let fileDir = `uploads/files/${date}`;
        let fileName = `${fileDir}/${request.file.originalname}`;

        mkdirSync(fileDir, {recursive: true});  // Create directory if it doesn't exist
        renameSync(request.file.path, fileName);  // Move file to the directory

        return response.status(200).json({filePath : fileName});
    }
    catch (error) {
        console.log(error.message);
        return response.status(500).send("Internal Server Error Occured");
    }
};