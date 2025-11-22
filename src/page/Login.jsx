import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/'); // Login ke baad Home jao
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 border p-10 shadow-lg rounded w-80">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                <input 
                    type="email" placeholder="Email" 
                    className="border p-2" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" placeholder="Password" 
                    className="border p-2" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit" className="bg-black text-white py-2">LOGIN</button>
                <p className="text-xs text-center mt-2">Don't have an account? Register</p>
            </form>
        </div>
    );
}

export default Login;