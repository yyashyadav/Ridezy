import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext';
import { userLogin } from '../services/auth.service';

const UserLogin = () => {
    //we use this for data handling in react calle two way binding 

    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [userData,setUserData]=useState({});

    const {user,setUser}=useContext(UserDataContext);
    const navigate=useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await userLogin(email, password);
            setUser(data.user);
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            const data = await userLogin('testuser@gmail.com', 'testuser');
            setUser(data.user);
            navigate('/home');
        } catch (err) {
            setError('Guest login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
       <div>
       <img className='w-16 mb-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
        <form onSubmit={handleSubmit}>
            <h3 className='text-lg font-medium mb-2'>What's your email</h3>

            <input
             value={email}
             //this is called two way binding
             onChange={(e)=>{
                setEmail(e.target.value)
                // console.log(e.target.value)
             }}
             required
             className='bg-[#eeeeee] mb-7 px-4 py-2 rounded border w-full text-lg placeholder:text-base'
             type="email" 
             placeholder='example@gmail.com'
             disabled={isLoading} />

            <h3 className='text-lg font-medium mb-2'>Enter Password</h3>

            <input 
             value={password}
             //this is called two way binding
             onChange={(e)=>{
                setPassword(e.target.value)
                // console.log(e.target.value)
             }}
            required 
            className='bg-[#eeeeee] mb-7 px-4 py-2 rounded border w-full text-lg placeholder:text-base'
            type="password"
            placeholder='password'
            disabled={isLoading} />

            {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <button
            type="submit"
            className='bg-[#111] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base disabled:opacity-50'
            disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <button
            type="button"
            onClick={handleGuestLogin}
            className='bg-[#666] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base disabled:opacity-50'
            disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login as Guest User'}
            </button>

            <p className='text-center'>New here? <Link to='/signup' className='text-blue-600' >Create new Account</Link></p>
        </form>

       </div>
       <div>
            <Link to='/captain-login'
                className='bg-[#10b461] flex items-center justify-center text-white font-semibold mb-7 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Sign in as Captain</Link> 
       </div>
    </div>
  )
}

export default UserLogin