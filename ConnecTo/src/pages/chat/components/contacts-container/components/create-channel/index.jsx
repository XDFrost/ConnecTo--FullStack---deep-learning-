import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../components/ui/tooltip"
import { FaPlus } from 'react-icons/fa'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "../../../../../../components/ui/input"  
import { apiClient } from '../../../../../../lib/api-client';
import { CREATE_CHANNEL_ROUTE, GET_AlL_CONTACTS_ROUTE } from "../../../../../../../utils/constants"
import { Button } from "../../../../../../components/ui/button"
import MultipleSelector from "../../../../../../components/ui/MultipleSelect"
import { useAppStore } from "../../../../../../store";

const CreateChannel = () => {
  const { addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_AlL_CONTACTS_ROUTE, {
        withCredentials: true,
      });
      setAllContacts(response.data.contacts);
    }
    getData();
  }, []);
  
  // console.log("All contacts" , allContacts);
  const createChannel = async () => {
    try {
      if(channelName.length > 0 && selectedContacts.length > 0) {

        const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
          name: channelName,
          members: selectedContacts.map((contact) => contact.value),
        }, {withCredentials: true});
        
        if(response.status === 201) {
          addChannel(response.data.channel);
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
        }
      };
    }
    catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus  
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 transition-all cursor-pointer duration-300"
            onClick={() => setNewChannelModal(true)}/>
          </TooltipTrigger>
          
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Create new Channel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white width-[400px] h-[400px] flex flex-col items-center">
            <DialogHeader>
            <DialogTitle>
                Please fill up details to create a new channel
            </DialogTitle>
            </DialogHeader>

            <div className="w-full flex justify-center">
                <Input placeholder = "Channel Name"
                onChange = {(e) => setChannelName(e.target.value)}
                value = {channelName}
                className="rounded-lg p-6 bg-[#2c2a3b] border-none w-[400px]"/>
            </div>

            <div className="w-[400px]">
              <MultipleSelector
              className = "rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder = "Search Contacts"
              value = {selectedContacts}
              onChange = {setSelectedContacts}
              emptyIndicator = {
                <p className="text-center text-lg leading-10 text-gray-600">
                  No Results Found
                </p>
              }/>
            </div>

            <div>
              <Button className = "w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createChannel}
              disabled = {(selectedContacts.length === 0 || channelName == "") ? true : false}>
                Create Channel
              </Button>
            </div>
        
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateChannel