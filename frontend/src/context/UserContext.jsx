import React, { createContext, useState } from 'react'
//this will create the context
export const UserDataContext=createContext();

const UserContext = ({children}) => {
    const [user,setUser]=useState({
        email:'',
        fullname:{
            firstname:'',
            lastname:''
        }
    })


  return (
    <div>
        <UserDataContext.Provider value={{user,setUser}}>
            {children}
        </UserDataContext.Provider>
    </div>
  )
}

export default UserContext