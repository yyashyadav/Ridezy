import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { SocketContext } from '../context/SocketContext'

const UserProtectedWrapper = ({children}) => {

    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const { user, setUser } = useContext(UserDataContext)
    const { joinUser } = useContext(SocketContext)
    const [ isLoading, setIsLoading ] = useState(true)

    useEffect(() => {
        if (!token) {
            navigate('/login')
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (response.status === 200) {
                setUser(response.data)
                joinUser(response.data._id)
                setIsLoading(false)
            }
        })
            .catch(err => {
                console.log(err)
                localStorage.removeItem('token')
                navigate('/login')
            })
    }, [ token ])

    if (isLoading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserProtectedWrapper