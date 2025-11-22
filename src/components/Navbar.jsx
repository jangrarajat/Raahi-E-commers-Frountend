import React from 'react'
import { User, Heart, Handbag, Search, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <>
            <div className=' h-16 md:h-20 w-full  p-3 flex items-center font-sans   fixed  bg-white  z-50 '>
                <div className='w-[50%] flex items-center'>
                    <div >
                        <Link to='/'>
                            <img src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763718042/Gemini_Generated_Image_saghf3saghf3sagh_whaulb.jpg" alt="logo" className='w-20' />
                        </Link>
                    </div>

                    <div className=' hidden md:flex gap-7 mx-5'>
                        <Link to='/product/ladies' className=' hover:underline uppercase '>Ladies</Link>
                        <Link to='/product/man' className=' hover:underline uppercase '>Man</Link>
                        <Link to='/product/kids' className=' hover:underline uppercase '>Kids</Link>
                        <Link to='/product/all' className=' hover:underline uppercase '>Accessories</Link>
                    </div>
                </div>
                <div className=' flex w-[50%] items-center justify-end pr-5 gap-5 md:gap-10'>
                    <a href="#"><Search size={17} /></a>
                    <a href="#"><User size={17} /></a>
                    <a href="#"><Heart size={17} /></a>
                    <a href="#"><Handbag size={17} /></a>
                    <a href="#" className='flex md:hidden'><Menu size={17} /></a>
                </div>
            </div>
            <div className=' h-16 md:h-20 w-full p-3 relative bg-white'></div>
        </>
    )
}

export default Navbar
