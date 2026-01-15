import React, { useEffect, useState } from 'react'
import { User, Heart, Handbag, Search, Menu, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from './auth/Login'
import Registration from './auth/Registration'
import { useNavigate } from 'react-router-dom'
import { SUB_CATEGORIES } from '../commonData/jsData'
function Navbar() {
    const navigate = useNavigate()

    const { user,
        showAuth,
        setShowAuth,
        isLoginView,
        setIsLoginView } = useAuth()



    const showUser = () => {
        if (user === null) return setShowAuth(true)
        navigate('/user')
    }




    return (
        <>
            {showAuth ? isLoginView ? (
                <Login setIsLoginView={setIsLoginView} setShowAuth={setShowAuth} />
            )
                : (
                    <Registration setIsLoginView={setIsLoginView} setShowAuth={setShowAuth} />
                )
                : null}

            <div className=' h-16 md:h-20 w-full  p-3 flex items-center font-sans   fixed  bg-white  z-40 '>
                <div className='w-[50%] flex items-center'>
                    <div >
                        <Link to='/'>
                            <img src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763718042/Gemini_Generated_Image_saghf3saghf3sagh_whaulb.jpg" alt="logo" className='w-20' />
                        </Link>
                    </div>

                    <div className=' hidden md:flex gap-7 mx-5'>
                        <Link to='/product/all' className=' hover:underline uppercase '>All</Link>
                        <Link to='/product/Women' className=' hover:underline uppercase '>Women</Link>
                        <Link to='/product/Men' className=' hover:underline uppercase '>Men</Link>
                        <Link to='/product/Kids' className=' hover:underline uppercase '>Kids</Link>
                        <Link to='/product/Accessories' className=' hover:underline uppercase '>Accessories</Link>

                    </div>


                </div>
                <div className=' flex w-[50%] items-center justify-end pr-5 gap-5 md:gap-10'>
                    <a href="#"><Search size={17} /></a>
                    <a  ><User size={17} onClick={showUser} className=' cursor-pointer' /></a>
                    <Link to='/like'><Heart size={17} /></Link>
                    <Link to='/cart'><Handbag size={17} /></Link>
                    {/* <a href="#" className='flex md:hidden'><Menu size={17} /></a> */}
                </div>
            </div>
            <div className=' h-28 md:h-20 w-full p-3 relative bg-white'></div>
            {/* phone mode serch filder */}
            <div
                className='md:hidden flex gap-7  
                           justify-center items-center h-10
                           fixed top-16 bg-white
                           z-20
                          w-full  text-black  '>
                <Link to='/product/all' className=' hover:underline uppercase '>All</Link>
                <Link to='/product/Women' className=' hover:underline uppercase '>Women</Link>
                <Link to='/product/Men' className=' hover:underline uppercase '>Men</Link>
                <Link to='/product/Kids' className=' hover:underline uppercase '>Kids</Link>
                <Link to='/product/Accessories' className=' hover:underline uppercase '>Accessories</Link>
                
            </div>

        </>
    )
}

export default Navbar


