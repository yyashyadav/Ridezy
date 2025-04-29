import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import CaptainSignup from './pages/CaptainSignup'
import CaptainLogin from './pages/CaptainLogin'
import { LoadScript } from '@react-google-maps/api'
import Home from './pages/Home'
import UserProtectedWrapper from './pages/UserProtectedWrapper'
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'

const App = () => {

//  const ans= useContext(UserDataContext);
//  console.log(ans);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div>
        <Routes>
            <Route path='/' element={<Start/>}/>
            <Route path='/login' element={<UserLogin/>}/>
            <Route path='/signup' element={<UserSignup/>}/>
            <Route path='/captain-login' element={<CaptainLogin/>}/>
            <Route path='/captain-signup' element={<CaptainSignup/>}/>
            <Route path='/riding' element={<Riding/>} />
            <Route path='/captain-riding' element={<CaptainRiding/>}/>
            {/* from we navigate to the protected route  */}
            <Route path='/home' element={
              <UserProtectedWrapper>
                <Home/>
              </UserProtectedWrapper>
            } />
            <Route path='/user/logout' element={
              <UserProtectedWrapper>
                <UserLogout/>
              </UserProtectedWrapper>
            } />
            <Route path='/captain-home'element={
              <CaptainProtectWrapper>
                <CaptainHome/>
              </CaptainProtectWrapper>
            }/>
        </Routes>
      </div>
    </LoadScript>
  )
}

export default App
