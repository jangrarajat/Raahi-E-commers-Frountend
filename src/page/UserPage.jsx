import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ButtonLoader from '../components/loader/ButtonLoader'

function UserPage() {
    const { user, logout ,logoutLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user === null) return navigate('/')
    }, [])


    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row ">
            <div className=' w-full  md:w-[30%] min-h-[60vh] font-sans p-10 flex flex-col gap-5 '>
                <div>
                    <div className='mb-5'>
                        <h1>Welcome ,{user?.username} </h1>
                    </div>
                    <h1 className='font-bold text-4xl uppercase'>
                        {
                            user?.role === 'owner' ? `i am the ${user?.role}` : null
                        }
                    </h1>
                </div>

                <div>
                    {
                        user?.role === 'owner' ? (
                            <>
                            <button className=' uppercase font-normal text-3xl hover:underline'>dashboard</button>
                            </>
                            )  : null
                    }
                </div>
                <div className='my-12'>
                    <ul className=' uppercase text-2xl font-semibold  '>
                        <li className=' hover:underline  my-2 font-bold'>Account & Settings</li>
                        <li className=' hover:underline  my-2 cursor-pointer font-normal'>Orders</li>
                        <li className=' hover:underline  my-2 cursor-pointer font-normal'>R&M Membership</li>
                        <li className=' hover:underline  my-2 cursor-pointer font-normal'>Account settings</li>
                    </ul>
                </div>
                <div>
                    <button className=' underline flex flex-row '
                        onClick={logout}
                    >
                        SIGN OUT {logoutLoading ? (<><ButtonLoader/></>): null}
                    </button>
                </div>

            </div>
            <div className=' w-full  md:w-[70%] min-h-[100vh] p-5 '>
                <div>
                    <h1 className='text-5xl font-extrabold  text-center mt-14 tracking-tighter uppercase leading-9'>
                        Account&<br /> Rewards
                    </h1>
                </div>
            </div>

        </div>
    )
}

export default UserPage
