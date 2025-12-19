import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function ForgetPasswordPage() {
    const [email, setEmail] = useState("")
    const [getEmailSendOtp, setGetEmailSendOtp] = useState(true)
    return (
        <div className="w-full min-h-fit bg-white flex  justify-center p-5 ">
            <div className='w-[100vh] md:w-[70vh] '>
                <h1 className='text-5xl font-extrabold mb-28  text-start  mt-14 tracking-tighter uppercase leading-9'>
                    Forget password
                </h1>
                <div className='flex flex-col'>
                    {
                       getEmailSendOtp ? (<>
                            <label
                                htmlFor="email">
                                Email
                                <span
                                    className='text-red-900'>
                                    *
                                </span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                id='email'
                                required
                                className=' border border-gray-400 w-full h-16 hover:border-gray-800 focus:outline-none px-5'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                className=' border border-gray-400 w-full h-16 px-5 bg-black text-white my-5  uppercase' >
                                Sent otp
                            </button></>) : null
                    }




                </div>

            </div>
        </div>
    )
}

export default ForgetPasswordPage
