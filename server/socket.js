import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = ( server ) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        for(const [userId, socketId] of userSocketMap.entries()) {
            if(socketId === socket.id) {
                userSocketMap.delete(userId);
                // console.log(`User with userId: ${userId} disconnected`);
                break;
            }
        }
    };

    const sendMessage = async (message) => {
        if (!message.sender || !message.recipient) {
            console.error("Error: 'sender' or 'recipient' is missing in message data.");
            console.log(message);
            return;
        }

        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

        if(recipientSocketId) {
            io.to(recipientSocketId).emit("recieveMessage", messageData);
        }

        if(senderSocketId) {
            io.to(senderSocketId).emit("recieveMessage", messageData);
        }
    };

    const sendChannelMessage = async (message) => {
        // console.log(message);
        const { channelId, sender, content, messageType, fileUrl } = message;
        
        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        })

        const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push : { messages: createdMessage._id },
        });

        const channel = await Channel.findById(channelId)
        .populate("members");

        const finalData = {...messageData._doc, channelId: channel._id}     // _doc is used to get the actual data from the document

        if(channel && channel.members) {
            channel.members.forEach((member) => {

                const memberSocketId = userSocketMap.get(member._id.toString());
                if(memberSocketId) {
                    io.to(memberSocketId).emit("recieve-channel-message", finalData);
                }

            });
            
            const adminSocketId = userSocketMap.get(channel.admin._id.toString());
            if(adminSocketId) {
                io.to(adminSocketId).emit("recieve-channel-message", finalData);
            }
        }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if(userId) {
            userSocketMap.set(userId, socket.id);
            // console.log(`User connected with socket id: ${socket.id}`);
        }
        else {
            console.log("UserId not found in socket query");
        }
        
        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};


export default setupSocket;