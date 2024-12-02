import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { useAppStore } from "../../../../../../store";
import { apiClient } from "../../../../../../lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from "../../../../../../../utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import "./index.css"
import { IoClose } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "../../../../../../lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const containerRef = useRef(); // New ref for the scroll container
  const { userInfo, selectedChatType, selectedChatData, selectedChatMessages, setSelectedChatMessages, directMessagesContacts, setDirectMessagesContacts, setFileDownloadProgress, setIsDownloading } = useAppStore();
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  // let res = useRef();
  
  // console.log(selectedChatData);
  // console.log(selectedChatData.contact.members);
  // directMessagesContacts.filter(contact => console)

  const removeFromContactListIfNoMessages = (contactId) => {
    const updatedContacts = directMessagesContacts.filter((contact => contact._id !== contactId));
    setDirectMessagesContacts(updatedContacts);
  }

  const addIfNotInContactList = (contact) => {
    const contactExists = directMessagesContacts.find(c => c._id === contact._id);
    // console.log(contact.members !== undefined);
    if(!(contact.members !== undefined) && !contactExists) {
      setDirectMessagesContacts([...directMessagesContacts, contact]);
    }
  }

  useEffect(()=> {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE,
        {id: selectedChatData.contact._id},
        {withCredentials: true});

        // res.current = response;

        if(response.data.messages) {
          (response.data.messages.length === 0) 
          ? removeFromContactListIfNoMessages(selectedChatData.contact._id) 
          : addIfNotInContactList(selectedChatData.contact);
          
          setSelectedChatMessages(response.data.messages);
        }
      }
      catch (err) {
        console.log(err);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData.contact._id}`,
        {withCredentials: true});

        if(response.data.messages) {
          (response.data.messages.length === 0) 
          ? removeFromContactListIfNoMessages(selectedChatData.contact._id) 
          : addIfNotInContactList(selectedChatData.contact);
          
          setSelectedChatMessages(response.data.messages);
        }
      }
      catch (err) {
        console.log(err);
      }
    };

    if(selectedChatData.contact._id) {
      if(selectedChatType === "contact") {
        getMessages();
      }
      else if(selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages, addIfNotInContactList, removeFromContactListIfNoMessages]);
  
  // console.log(GET_CHANNEL_MESSAGES);
  // console.log(selectedChatData.contact)
  // console.log(res);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Check if we're within 100 pixels of the bottom
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    setIsNearBottom(nearBottom);
  };

  useEffect(() => {
  // Only scroll to bottom if explicitly needed, not on every message load
  if (scrollRef.current) {
    const container = scrollRef.current.parentElement;
    const isScrolledToBottom = 
      container.scrollHeight - container.clientHeight <= container.scrollTop + 10;
    
    if (isScrolledToBottom) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [selectedChatMessages])


  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {
            selectedChatType === "contact" && renderDMMessage(message)
          }

          {
            selectedChatType === "channel" && renderChannelMessage(message)
          }
        </div>
      )
    });
  };

  const checkIfImage = (filepath) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|heic|ico|webp|svg)$/i;
    return imageRegex.test(filepath);
  };

  const downloadFile = async (url) => {
    
    setIsDownloading(true);
    setFileDownloadProgress(0);

    const response = apiClient.get(`${HOST}/${url}`, 
      { responseType: "blob",
          onDownloadProgress: (progressEvent) => {
          const {loaded, total} = progressEvent;
          const percentCompeleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompeleted);
        }
      },
    );   // responseType: "blob" is used to download the file
    
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));    // Create a URL for the blob
    const link = document.createElement("a");   // Create a link element
    link.href = urlBlob;    // Set the href of the link
    link.setAttribute("download", url.split("/").pop());   // Set the download attribute
    document.body.appendChild(link);    // Append the link to the body
    link.click();     // Click the link
    link.remove();    // Remove the link
    window.URL.revokeObjectURL(urlBlob);    // Revoke the object URL
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDMMessage = (message) => (
    <div className={`${message.sender === selectedChatData.contact._id ? "text-left" : "text-right"}`}>
      {message.messageType === "text" && (
        <div 
        className={`${message.sender !== selectedChatData.contact._id 
                  ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50" 
                  : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block rounded p-4 my-1 max-w-[50%] break-words}
                  style={{whiteSpace: "pre-wrap"}`}
        >
        {message.content}
      </div>)}

      {message.messageType === "file" && (
        <div 
          className={`${message.sender !== selectedChatData.contact._id 
                    ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50" 
                    : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block rounded p-4 my-1 max-w-[50%] break-words}
                    style={{whiteSpace: "pre-wrap"}`}
          >
          {checkIfImage(message.fileUrl) 
          ? <div onClick = { () => {
              setShowImage(true);
              setImageURL(`${message.fileUrl}`);
            }}
              className="cursor-pointer">
              <img src = {`${HOST}/${message.fileUrl}`} height={300} width={300}/>
            </div> 
          : <div className="flex items-center justify-center gap-5">
              <span className="text-white/18 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip/>
              </span>
              <span className="hidden sm:inline">
                {message.fileUrl.split("/").pop()} 
              </span>
              <span onClick={() => downloadFile(message.fileUrl)} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
                <IoMdArrowRoundDown/>
              </span>
            </div>}
        </div>
      )}

      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessage = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block rounded p-4 my-1 max-w-[50%] break-words`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {message.content}
          </div> 
        )}

        {message.messageType === "file" && (
        <div 
          className={`${message.sender._id === userInfo.id 
                    ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50" 
                    : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block rounded p-4 my-1 max-w-[50%] break-words}
                    style={{whiteSpace: "pre-wrap"}`}
          >
          {checkIfImage(message.fileUrl) 
          ? <div onClick = { () => {
              setShowImage(true);
              setImageURL(`${message.fileUrl}`);
            }}
              className="cursor-pointer">
              <img src = {`${HOST}/${message.fileUrl}`} height={300} width={300}/>
            </div> 
          : <div className="flex items-center justify-center gap-5">
              <span className="text-white/18 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip/>
              </span>
              <span className="hidden sm:inline">
                {message.fileUrl.split("/").pop()} 
              </span>
              <span onClick={() => downloadFile(message.fileUrl)} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
                <IoMdArrowRoundDown/>
              </span>
            </div>}
        </div>
      )}
        {/* {console.log(message.sender)} */}
        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 md:w-12 md:h-12 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              )}
  
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName[0]
                  : message.sender.email}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">
              {`${message.sender.firstName} ${message.sender.lastName}`}
            </span>
  
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className="flex-1 overflow-y-scroll scrollbar-hidden-track p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
    onScroll={handleScroll}>
      {renderMessages()}
      <div ref={scrollRef}/>
      {
        showImage && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img 
              src={`${HOST}/${imageURL}`}
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          
          <div className="flex gap-5 fixed top-0 mt-5">

            <button onClick={() => downloadFile(imageURL)} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
              <IoMdArrowRoundDown/>
            </button>

            <button onClick={() => {
              setShowImage(false);
              setImageURL(null);
            }} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
              <IoClose/>
            </button>

          </div>
        </div>
      }
    </div>
  );
};

export default MessageContainer;