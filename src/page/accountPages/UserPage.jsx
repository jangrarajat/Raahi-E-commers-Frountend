import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import {
    User, Heart, Handbag, Search, Menu, X, ChevronRight, Clock, Trash2, ArrowRight,
    Box, MapPin, Settings, Key, LogOut, LayoutDashboard,
    User2
} from 'lucide-react'
import AccountMenuBar from '../../components/AccountMenuBar'

function UserPage() {
    const { user, logout, logoutLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user === null || !user) return navigate('/')
    }, [])


    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row ">
            <AccountMenuBar />
            <div className=' w-full  md:w-[70%] min-h-[100vh] p-5 '>
                <div>
                    <h1 className=' text-4xl md:text-5xl font-extrabold   text-center md:text-start   tracking-tighter uppercase leading-9'>
                        Account&<br className=' hidden md:flex' /> Rewards
                    </h1>
                    <h1 className=' mt-5 px-5 font-sans uppercase'>{user.username}</h1>
                    <h1 className=' mt-1 px-5 font-sans '>{user.email}</h1>
                    <h1 className=' mt-2 px-5 font-sans uppercase'><span className='mr-3'>user id :</span>{user._id}</h1>
                </div>

                <div className=' md:hidden grid grid-flow-row grid-cols-2     my-5 rounded-md p-5 gap-2'>

                    {
                        user?.role === "owner" ? (<Link to='/account/dashboard' className=' border border-gray-500  flex bg-green items-center gap-4 py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                            <LayoutDashboard size={20} /> Dashboard
                        </Link>) : null
                    }
                    <Link to='/user/orders' className='flex items-center gap-4 border border-gray-500 py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                        <Box size={20} /> Orders
                    </Link>
                    <Link to='/account/setting' className='flex items-center gap-4 border border-gray-500 py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                        <MapPin size={20} /> Addresses
                    </Link>
                    <Link to='/account/setting' className='flex items-center gap-4 py-2 border border-gray-500 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                        <Settings size={20} /> Settings
                    </Link>
                    {/* Reset Password Option */}
                    <Link to='/account/changepassword' className='flex items-center gap-4 py-2 border border-gray-500 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                        <Key size={20} /> Reset Password
                    </Link>
                    {/* <Link to='/' onClick={logout} className='flex items-center gap-4 py-2 border border-gray-500 hover:bg-gray-50 rounded-lg px-2 text-gray-700 font-medium'>
                         <LogOut size={20}/> Log-out
                    </Link> */}


                </div>

                <div className=' shadow-lg shadow-black md:w-[50%] min-h-44 bg-orange-500 flex flex-col md:flex-row md:mt-10 '>
                    <div className='w-[100%] md:w-[50%] h-[60vh] md:h-[40vh] bg-pink-500 bg-cover'
                        style={{ backgroundImage: `url('https://i.pinimg.com/736x/86/57/97/8657978ee113d8a786501cceff4dc049.jpg')` }}
                    >
                    </div>
                    <div className='w-[100%] md:w-[50%] h-[60vh] md:h-[40vh] bg-purple-500 bg-cover'
                        style={{ backgroundImage: `url('https://i.pinimg.com/1200x/2e/c7/e5/2ec7e5fbcff4b6f8cd8983d54aa8e2a1.jpg')` }}
                    >
                    </div>
                </div>
            </div>

        </div>
    )
}

export default UserPage
