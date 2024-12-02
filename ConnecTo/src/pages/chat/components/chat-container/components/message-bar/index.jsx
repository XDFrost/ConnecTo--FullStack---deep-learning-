import { useEffect, useRef, useState } from "react";
import { GrAttachment } from 'react-icons/gr'
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "../../../../../../store";
import { useSocket } from "../../../../../../context/SocketContext";
import { apiClient } from "../../../../../../lib/api-client";
import { modelClient } from "../../../../../../lib/model-client";
import { CHECK_NSFW_IMAGE_ROUTE, UPLOAD_FILE_ROUTE } from "../../../../../../../utils/constants";
import axios from "axios";
import { toast } from "sonner";

const MessageBar = () => {
  const emojiRef = useRef();
  const EnterRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { selectedChatType, 
          selectedChatData, 
          userInfo,
          setIsUploading,
          setFileUploadProgress } = useAppStore();
  
  useEffect(() => {
    // Focus on the input field when the component mounts
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiRef]);

  const handleSendMessage = async () => {
    // console.log(selectedChatType)
    // console.log(selectedChatData.contact._id);
    if(selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message, 
        recipient: selectedChatData.contact._id,
        messageType: "text",
        fileUrl: undefined,
      });
    }
    
    else if(selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData.contact._id,
      })

    // console.log(userInfo.id);
    
    }
    
    setMessage("");
  };

  const handleAddEmoji = (emoji) => {
    setMessage(message + emoji.emoji);
    inputRef.current.focus();
  };

  const handleEnterPress = (e) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      // if(message.trim() === "") return;\
      if(message !== "") {
        handleSendMessage();
      }
    }
  };

  const handleAttachmentClick = () => {
    if(fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleAttachmentChange = async (e) => {
    try {
        const file = e.target.files[0];
        // console.log({file});
        if(file) {
          const formData = new FormData();
          formData.append("file", file);
          setIsUploading(true);

          

          // const checkNSFW = await modelClient.post(CHECK_NSFW_IMAGE_ROUTE, formData, {
          //   headers: {
          //     'Content-Type': 'multipart/form-data',
          //   },
          // })
          const checkNSFW = await axios.post(
            "http://localhost:9000/api/models/classifyNSFW",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const data = await checkNSFW.data;
          const { score } = data.result[1]
          if(score > 0.01) {
            setIsUploading(false);
            toast.error("NSFW content detected!");
            return;
          }

          const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
            withCredentials: true,
            onUploadProgress: data => {
              setFileUploadProgress(Math.round((100 * data.loaded) / data.total));    // Calculate the progress percentage
            },
          });

          if(response.status === 200 && response.data) {
            setIsUploading(false);
            if(selectedChatType === "contact") {
              socket.emit("sendMessage", {
                sender: userInfo.id,
                content: undefined,
                recipient: selectedChatData.contact._id,
                messageType: "file",
                fileUrl: response.data.filePath,
              });
            }
            else if(selectedChatType === "channel") {
              socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: undefined,
                messageType: "file",
                fileUrl: response.data.filePath,
                channelId: selectedChatData.contact._id,
              });
            }
          }
        }
    }
    catch (error){
      setIsUploading(false);
      console.log({error});
    }
  }

  return (
    <div className="h-[7vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-5 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input type="text" 
        placeholder="Enter Message"
        className="flex-1 p-4 bg-transparent rounded-md focus:border-none focus:outline-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        ref={inputRef}
        onKeyDown={handleEnterPress}
        />

        <button onClick={handleAttachmentClick}
        className='text-neutral-500 focus:border-none focus:outline-none focus:text-white hover:text-white duration-300 transition-all'>
          <GrAttachment size={20}/>
        </button>

        <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange}/>

        <div className="relative">
          <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white hover:text-white duration-300 transition-all'
          onClick={() => setEmojiPickerOpen(true)}>
            <RiEmojiStickerLine size={24} className="mt-[5px]"/>
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker 
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      
      <button className={`bg-[#8417ff] rounded-md flex items-center justify-center p-4 focus:border-none hover:bg-[#741bda] focus:bg-[#6917c8] focus:outline-none focus:text-white duration-300 transition-all ${message.trim() === "" ? "cursor-not-allowed bg-[#45167a] hover:bg-[#45167a] focus:bg-[#45167a]" : "cursor-pointer"}`}
      disabled={message.trim() === ""}
      onClick={handleSendMessage}
      ref={EnterRef}>
        <IoSend size={20}/>
      </button>
    
    </div>
  );
};

export default MessageBar;