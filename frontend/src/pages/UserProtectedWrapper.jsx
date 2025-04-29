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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/login')
                return
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.status === 200) {
                    setUser(response.data)
                    joinUser(response.data._id)
                    setIsLoading(false)
                }
            } catch (err) {
                console.error('Authentication error:', err)
                // Only clear token and redirect if it's an authentication error
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    navigate('/login')
                } else {
                    setError('Failed to verify authentication. Please try again.')
                    setIsLoading(false)
                }
            }
        }

        verifyToken()
    }, [token, navigate, setUser, joinUser])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    return <>{children}</>
}

export default UserProtectedWrapper