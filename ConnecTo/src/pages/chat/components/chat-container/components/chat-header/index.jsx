import { RiCloseFill } from 'react-icons/ri';
import { useAppStore } from '../../../../../../store';
import { Avatar, AvatarImage } from '../../../../../../components/ui/avatar';
import { HOST } from '../../../../../../../utils/constants';
import { getColor } from '../../../../../../lib/utils';

const ChatHeader = () => {
  const { closedChat, selectedChatData, selectedChatType } = useAppStore();
  // console.log(selectedChatData.contact);
  
  return (
    <div className="h-[8vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className='flex gap-5 items-center w-full justify-between'>
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            {
              selectedChatType === "contact" 
              ? <Avatar className="h-12 w-12 md:w-12 md:h-12 rounded-full overflow-hidden">
                  {
                    selectedChatData.contact.image
                    ? <AvatarImage src = {`${HOST}/${selectedChatData.contact.image}`} alt = "profile" className="object-cover w-full h-full bg-black rounded-full"/> 
                    : <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedChatData.contact.color
                    )}`}>
                      {selectedChatData.contact.firstName 
                      ? selectedChatData.contact.firstName[0]
                      : selectedChatData.contact.email[0]}
                    </div>
                  }
                </Avatar> 
              : <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                  # 
                </div>
            }
            
          </div>
          <div>
            {selectedChatType === "channel" ? selectedChatData.contact.name : ""}
            {selectedChatType === "contact" && selectedChatData.contact.firstName 
            ? `${selectedChatData.contact.firstName} ${selectedChatData.contact.lastName}`
            : selectedChatData.contact.email}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button 
          onClick={closedChat}
          className='text-neutral-300 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
            <RiCloseFill size={25}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;