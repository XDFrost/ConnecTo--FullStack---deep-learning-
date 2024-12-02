import { createContext, useContext, useEffect, useRef } from "react";
import { useAppStore } from "../store";
import { HOST } from "../../utils/constants";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socketRef = useRef();
    const { userInfo } = useAppStore();

    useEffect(() => {
        if(userInfo) {
            socketRef.current = io(HOST, {
                withCredentials: true,
                query: {
                    userId: userInfo.id
                },
            });
            
            socketRef.current.on("connect", () => {
                console.log("Socket connected");
            });

            const handleReceiveMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addContactsInDmContacts } = useAppStore.getState();

                if(selectedChatType !== undefined && (selectedChatData.contact._id === message.sender._id || selectedChatData.contact._id === message.recipient._id)) {
                    addMessage(message);
                }
                addContactsInDmContacts(message);
            };

            const handleReceiveChannelMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addChannelInChannelList } = useAppStore.getState();

                if(selectedChatType !== undefined && selectedChatData.contact._id === message.channelId) {
                    addMessage(message);
                }
                addChannelInChannelList(message);
            };

            socketRef.current.on("recieveMessage", handleReceiveMessage);
            socketRef.current.on("recieve-channel-message", handleReceiveChannelMessage);

            return () => {
                socketRef.current.disconnect();
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};