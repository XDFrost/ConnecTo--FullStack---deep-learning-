import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../components/ui/tooltip"
import { FaPlus } from 'react-icons/fa'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "../../../../../../components/ui/input"  
import Lottie from "react-lottie"
import { animationDefaultOptions } from "../../../../../../lib/utils"
import { apiClient } from '../../../../../../lib/api-client';
import { SEARCH_CONTACTS_ROUTE } from "../../../../../../../utils/constants"
import { ScrollArea } from "../../../../../../components/ui/scroll-area"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { getColor } from "../../../../../../lib/utils"
import { HOST } from "../../../../../../../utils/constants"
import { useAppStore } from "../../../../../../store"

const NewDm = () => {
  const { setSelectedChatType, setSelectedChatData, } = useAppStore();
  
  // console.log(directMessagesContacts);
  
  const [openNewContactModel, setOpenNewContactModel] = useState(false);
  
  const [searchedContacts, setSeachedContacts] = useState([]);

  const searchContacts = async (searchTerm) => {
    try {
      if(searchTerm.length > 0) {
        const response = await apiClient.post(SEARCH_CONTACTS_ROUTE, 
        { searchTerm },
        { withCredentials : true });

        if(response.status === 200 && response.data.contacts) {
          setSeachedContacts(response.data.contacts);
        }
      }
      else {
        setSeachedContacts([]);
      }
    }
    catch (err) {
      console.log(err)
    }
  }; 

  const selectNewContact = (contact) => {
    setOpenNewContactModel(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSeachedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus 
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 transition-all cursor-pointer duration-300"
            onClick={() => setOpenNewContactModel(true)}/>
          </TooltipTrigger>
          
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Select new Contact</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>
        <DialogContent className="bg-[#181920] border-none text-white width-[400px] h-[400px] flex flex-col items-center">
            <DialogHeader>
            <DialogTitle>
                Please select a contact to start a conversation
            </DialogTitle>
            </DialogHeader>

            <div className="w-full flex justify-center">
                <Input placeholder = "Search Contacts"
                onChange = {(e) => searchContacts(e.target.value)} 
                className="rounded-lg p-6 bg-[#2c2a3b] border-none w-[400px]"/>
            </div>
            
            {
                searchedContacts.length > 0 &&
                <ScrollArea className="h-[250px] w-full">
                  <div className="flex flex-col gap-5 items-start pl-4">
                    {
                      searchedContacts.map(contact => (
                        <div key = {contact._id} 
                        className="flex gap-3 items-center cursor-pointer"
                        onClick={() => selectNewContact({contact})}>
                          <div className="w-12 h-12 relative">
                            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
                              {
                                contact.image
                                ? <AvatarImage src = {`${HOST}/${contact.image}`} alt = "profile" className="object-cover w-full h-full bg-black rounded-full"/> 
                                : <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                                contact.color
                                )}`}>
                                  {contact.firstName 
                                  ? contact.firstName[0] 
                                  : contact.email[0]}
                                </div>
                              }
                            </Avatar>
                          </div>
                          
                          <div className="flex flex-col">
                            <span>
                              {
                                contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName} ` : ""
                              }
                            </span>

                            <span className="text-xs">
                              {contact.email}
                            </span>
                          </div>

                        </div>
                      ))
                    }
                  </div>
                </ScrollArea> 
            }

            {
                searchedContacts.length <= 0 
                && 
                <div className="flex-1 md:bg-[#181920] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
                    <Lottie
                        isClickToPauseDisabled = {true}
                        height={100}
                        width={100}
                        options={animationDefaultOptions}
                    />

                    <div className='text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center'>
                        <h3 className='poppins-medium'>
                        Hi<span className='text-purple-500'>!</span> Search new <span className='text-purple-500'>Contacts.</span>
                        </h3>
                    </div>
                </div> 
            }
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewDm