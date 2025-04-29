import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL;

// Token management
export const setToken = (token, userType = 'user') => {
    const tokenKey = userType === 'user' ? 'token' : 'captainToken';
    localStorage.setItem(tokenKey, token);
    // Set default authorization header for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getToken = (userType = 'user') => {
    const tokenKey = userType === 'user' ? 'token' : 'captainToken';
    return localStorage.getItem(tokenKey);
};

export const removeToken = (userType = 'user') => {
    const tokenKey = userType === 'user' ? 'token' : 'captainToken';
    localStorage.removeItem(tokenKey);
    delete axios.defaults.headers.common['Authorization'];
};

// User authentication
export const userLogin = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, { email, password });
        if (response.data.token) {
            setToken(response.data.token, 'user');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Login failed' };
    }
};

export const userLogout = async () => {
    try {
        const token = getToken('user');
        if (token) {
            await axios.get(`${API_URL}/users/logout`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        removeToken('user');
    }
};

export const userRegister = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users/register`, userData);
        if (response.data.token) {
            setToken(response.data.token, 'user');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
    }
};

// Captain authentication
export const captainLogin = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/captains/login`, { email, password });
        if (response.data.token) {
            setToken(response.data.token, 'captain');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Login failed' };
    }
};

export const captainLogout = async () => {
    try {
        const token = getToken('captain');
        if (token) {
            await axios.get(`${API_URL}/captains/logout`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        removeToken('captain');
    }
};

export const captainRegister = async (captainData) => {
    try {
        const response = await axios.post(`${API_URL}/captains/register`, captainData);
        if (response.data.token) {
            setToken(response.data.token, 'captain');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Registration failed' };
    }
};

// Token verification
export const verifyToken = async (userType = 'user') => {
    try {
        const token = getToken(userType);
        if (!token) return null;

        const endpoint = userType === 'user' ? '/users/profile' : '/captains/profile';
        const response = await axios.get(`${API_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        removeToken(userType);
        return null;
    }
}; 