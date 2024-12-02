import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store"
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage} from "../../components/ui/avatar"
import { colors, getColor } from "../../lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { toast } from 'sonner';
import { apiClient } from "../../lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE } from "../../../utils/constants";
import ParticlesComponent from "../../components/particles"

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if(userInfo.profileSetups) {
      setFirstname(userInfo.firstName);
      setLastname(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if(userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo])

  const validateProfile = () => {
    if(!firstName) {
      toast("First Name is required");
      return false;
    }
    if(!lastName) {
      toast("Last Name is required");
      return false;
    }
    return true;
  }

  const saveChanges = async () => {
    if(validateProfile()) {
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
          firstName,
          lastName,
          color: selectedColor
        }, { withCredentials: true });
        if(response.status === 200 && response.data) {
          setUserInfo({...response.data});
          toast("Profile updated successfully");
          navigate("/chat");
        }
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  const handleNavigate = () => {
    if(userInfo.profileSetups) {
      navigate("/chat");
    }
    else {
      toast("Please complete your profile setup to continue");
    }
  }

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if(file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      
      if(response.status === 200 && response.data) {
        setUserInfo({...userInfo, image: response.data.image});
        toast("Profile image updated successfully");
      }
    }
  }

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true
      });
      
      if(response.status === 200) {
        setUserInfo({...userInfo, image: null});
        toast.success("Profile image removed successfully");
        setImage(null);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
      <div className="bg-[#121c24] h-[100vh] flex items-center justify-center flex-col gap-10 ">

        <ParticlesComponent id="particles"/>
        
        <div className="bg-[#19252f] rounded-3xl p-10 flex flex-col gap-10 w-[80vw] md:w-max z-10">
          <div>
            <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" onClick={handleNavigate}/>
          </div>

          <div className="grid grid-cols-2">
            <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
              <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
                {
                  image 
                  ? <AvatarImage src = {image} alt = "profile" className="object-cover w-full h-full bg-black"/> 
                  : <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                  selectedColor
                  )}`}>
                    {firstName 
                    ? firstName[0] 
                    : userInfo.email[0]}
                  </div>
                }
              </Avatar>
              {
                hovered && ( <div className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInputClick}> 
                { image 
                ? <FaTrash className="text-white text-3xl cursor-pointer"/>
                : <FaPlus className="text-white text-3xl cursor-pointer"/> 
                } </div> )
              }

              <input type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageChange} 
              name="Profile-image" 
              accept=".png, .jpg, .jpeg, .svg, .webp"
              />

            </div>
              <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
                <div className="w-full">
                  <Input 
                  placeholder="Email" 
                  value={userInfo.email} 
                  disabled 
                  type="email" 
                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                  />
                </div>
                <div className="w-full">
                  <Input 
                  placeholder="First Name" 
                  value={firstName}  
                  type="text" 
                  onChange={(e)=>setFirstname(e.target.value)}
                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                  />
                </div>
                <div className="w-full">
                  <Input 
                  placeholder="Last Name" 
                  value={lastName} 
                  type="text"
                  onChange={(e)=>setLastname(e.target.value)}
                  className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                  />
                </div>
                <div className=" w-full gap-5 flex">
                  {
                    colors.map((color, index) => (
                      <div key={index} 
                      onClick={()=>setSelectedColor(index)}
                      className={`h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${color} ${selectedColor === index 
                      ? "outline outline-white/80 outline-3" 
                      : ""}`}>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="w-full">
              <Button className="h-14 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" onClick={saveChanges}> Save Changes </Button>
            </div>
        </div>
      </div>  
  )
}

export default Profile