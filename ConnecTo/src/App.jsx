import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Auth from './pages/auth'
import Chat from './pages/chat'
import Profile from './pages/profile'
import { useAppStore } from './store'
import { useEffect, useState } from "react"
import { apiClient } from "./lib/api-client.js"
import { GET_USER_INFO } from "../utils/constants"
import WelcomePage from "./pages/WelcomePage/index.jsx"

const PrivateRoutes = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to='/' />;
};

const AuthRoutes = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to='/chat' /> : children;
};

function App() {

  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserData = async () => {
      
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true
        });

        if(response.status === 200 && response.data.id) {
          setUserInfo(response.data);
        }
        else {
          setUserInfo(null);
        }
      } 
      catch(error) {
        console.log(error);
      }
      finally {
        setLoading(false);
      }
    }

    if(!userInfo) {
      getUserData();
    }
    else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo])

  if(loading) {
    return <div>Loading...</div>
  }
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <AuthRoutes>
              <WelcomePage/>
            </AuthRoutes>
          }/>

          <Route path='/auth' element={
            <AuthRoutes>
              <Auth/>
            </AuthRoutes>
          }/>

          <Route path='/chat' element={
            <PrivateRoutes>
              <Chat/>
            </PrivateRoutes>
          }/>

          <Route path='/profile' element={
            <PrivateRoutes>
              <Profile/>
            </PrivateRoutes>
          }/>

          <Route path='*' element={<Navigate to='/'/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App
