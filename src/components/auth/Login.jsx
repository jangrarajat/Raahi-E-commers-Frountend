import { Lock, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Loader from '../loader/Loader'
import ButtonLoader from '../loader/ButtonLoader'
import FailedMsf from '../msg/FailedMsf'

function Login({ setIsLoginView, setShowAuth }) {
    const { login, logout, loginLaoding, loginFailedMsg } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")





    return (
        <div className=' fixed z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm w-full h-full'>
            <div className='w-full h-full bg-white md:w-[32%] md:h-[80%] sm:w-[60%] sm:h-[80%]  flex flex-col'>
                <div className='h-[10%] w-full  flex items-center justify-between  px-4'>
                    <h3 className=' uppercase'>
                        Sign in
                    </h3>
                    <X
                        className="cursor-pointer"
                        onClick={() => setShowAuth(false)}
                    />
                </div>

                <h1 className='h-[10%] w-full  flex items-center justify-between   px-4'>
                    <b className='font-medium text-center w-full' >
                        Sign in with your email  an R&M member.
                    </b>
                </h1>

                <form className=' w-full px-4 h-fit flex flex-col gap-2' >
                    <label htmlFor="email" className=' uppercase'>
                        email*
                    </label>
                    <input type="email" id='email' placeholder='EMAIL' required onChange={(e) => setEmail(e.target.value)}
                        className='border border-black px-4 py-3'

                    />
                    <label htmlFor="password" className=' uppercase'>
                        password*
                    </label>
                    <input type="password" id='password' placeholder='PASSWORD' required minLength={6} onChange={(e) => setPassword(e.target.value)}
                        className='border border-black px-4 py-3'
                    />

                    {loginLaoding ? (<div className='bg-black text-white font-extralight px-4 py-3 hover:bg-gray-900'

                    >
                        <ButtonLoader />
                    </div>)
                        :
                        (<button className='bg-black text-white font-extralight px-4 py-3 hover:bg-gray-900'
                            onClick={() => login(email, password)}
                        >
                            Continue
                        </button>)}

                </form>

                {
                    loginFailedMsg ? (
                        <div className='w-full px-4 min-h-5'>
                            <FailedMsf />
                        </div>
                    ) : null

                }

                <div className='w-full h-fit px-4'>
                    <h1 className=' uppercase text-xs py-2 cursor-pointer hover:underline'>forget password</h1>
                </div>


                <div className='w-full px-4 min-h-5'>
                    <button className='border  w-full my-3 h-11 border-black font-extralight px-4 py-3  cursor-pointer'
                        onClick={() => setIsLoginView(false)}
                    >
                        back to Signup
                    </button>
                </div>
                <h4 className='h-[10%] w-full  flex items-center justify-center text-sm gap-1 font-extralight  px-4'>
                    <Lock size={13} /> All data is kept secure

                </h4>
                <h4 className='h-[10%] w-full  uppercase flex items-end justify-center gap-1 font-extralight  px-4'>
                    R&M Membership
                </h4>
            </div>
        </div >
    )
}

export default Login
