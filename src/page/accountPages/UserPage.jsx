import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

import AccountMenuBar from '../../components/AccountMenuBar'

function UserPage() {
    const { user, logout, logoutLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user === null) return navigate('/')
    }, [])


    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row ">
            <AccountMenuBar />
            <div className=' w-full  md:w-[70%] min-h-[100vh] p-5 '>
                <div>
                    <h1 className='text-5xl font-extrabold mb-28  text-start  mt-14 tracking-tighter uppercase leading-9'>
                        Account&<br /> Rewards
                    </h1>
                </div>
                
                <div className='md:w-[50%] min-h-44 bg-orange-500 flex flex-col md:flex-row '>
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
