import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import OtpLoader from '../../components/loader/OtpLoader'
import { Check, CircleX } from 'lucide-react'
import MyMsges from '../../components/msg/MyMsges'


function ForgetPasswordPage() {
    const [email, setEmail] = useState("")
    const [getEmailSendOtp, setGetEmailSendOtp] = useState(true)
    const [verifyOtp, setVerifyOtp] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)
    const [myOtp, setMyotp] = useState("")
    const [lmsg, setLmsg] = useState("")
    const [passwordInput, setPasswordInput] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [conformPassword, setConformPassword] = useState("")
    const [msg, setMsg] = useState("")
    const [showErrorMsg, setShowErrorMsg] = useState(false)
    const [showSuccesskuMsg, setShowSuccessMsg] = useState(false)
    const [myShowState, setMyShowState] = useState(false)
    const [myShowMsg, setMyShowMsg] = useState("Some Error please try again later.")
    const [myShowRed, setMyShowRed] = useState(false)

    function onLoading(msg, l) {

        setLmsg(msg)
        setOtpLoading(l)
    }

    function handleMyTost(colour, msg) {
        setMyShowState(true)
        setMyShowMsg(msg)
        setMyShowRed(colour)

        setTimeout(() => {
            setMyShowState(false)
            setMyShowMsg("")
        }, 5000)
    }

    const sendOtp = async () => {
        if (email === "") return handleMyTost(false, "Email is requried")
        console.log("Sending OTP to:", email);
        setGetEmailSendOtp(false)
        onLoading("sending otp", true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/forgetPassword`, { email: email }, { withCredentials: true })

            if (res.data.success === true) {
                setGetEmailSendOtp(false)
                setVerifyOtp(true)
            }

        } catch (error) {
            setGetEmailSendOtp(true)
            console.log("error in sent otp ", error.response?.data?.message)
            handleMyTost(false, error.response?.data?.message)
            throw error
        } finally {
            onLoading("", false)
        }
    }


    const handleVerifyOtp = async () => {
        console.log(myOtp)
        onLoading("Verifying otp", true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/verify-otp`, { email: email, otp: myOtp }, { withCredentials: true })
            console.log(res.data?.message)
            if (res.data?.message === "OTP verified success") {
                setVerifyOtp(false)
                setPasswordInput(true)
            }
            if (res.data?.message === "OTP expired") {
                handleMyTost(false, "OTP expired")
                setGetEmailSendOtp(true)
                setVerifyOtp(false)
            }
        } catch (error) {
            console.log("error in VerifyOtp  ", error.response?.data?.message)
            handleMyTost(false, error.response?.data?.message)
            throw error
        } finally {
            onLoading("", false)
        }
    }


    const handleMsg = ({ status, msg }) => {
        if (status) {
            setShowSuccessMsg(status)
        } else {
            setMsg(msg)
            setShowErrorMsg(status)
        }

    }


    const handleSetNewPassword = async () => {
        if (newPassword === "" || conformPassword === "") return handleMyTost(false, "all fields are requried")
        if (newPassword !== conformPassword) return handleMyTost(false, "Conform password not same")
        console.log(conformPassword)

        onLoading("Laoding....", true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/setForgetPassword`, { newPassword: conformPassword }, { withCredentials: true })
            console.log(res.data?.message)
            handleMyTost(true, res.data?.message)
            setTimeout(() => {
                setPasswordInput(false)
                setGetEmailSendOtp(true)
            }, 5000)
        } catch (error) {
            console.log("error in handleSetNewPassword ", error.response?.data?.message)
            throw error
        } finally {
            onLoading("", false)
        }



    }


    return (
        <div className="w-full min-h-fit bg-white flex  justify-center p-5 ">
            <div className='w-[100vh] md:w-[70vh] '>
                <h1 className='text-5xl font-extrabold mb-28  text-start  mt-14 tracking-tighter uppercase leading-9'>
                    Forget password
                </h1>
                <div className='flex flex-col'>

                    {
                        showSuccesskuMsg ? (<>
                            <div
                                className=' w-full h-fit px-5  text-green-500 my-5   flex gap-3 text-xs justify-center items-center' >
                                <span><Check size={15} /> </span><span className='text-black'>Changed password.</span>
                            </div>
                        </>) : null
                    }

                    {
                        showErrorMsg ? (<>
                            <div
                                className=' w-full h-fit px-5  text-red-500 my-5   flex gap-3 text-xs justify-center items-center' >
                                <span> <CircleX size={15} /> </span><span className='text-black'>{msg}</span>
                            </div>
                        </>) : null
                    }



                    {
                        otpLoading ? (<>
                            <OtpLoader msg={lmsg} />
                        </>) : null
                    }

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
                                onClick={sendOtp}
                                className=' border border-gray-400 w-full h-16 px-5 bg-black text-white my-5  uppercase' >
                                Sent otp
                            </button></>) : null
                    }

                    {

                        verifyOtp ? (<>
                            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
                                <p className="text-gray-500 text-sm">Enter the 6-digit code sent to your email</p>

                                <div className="flex  flex-col w-full">

                                    <input
                                        type="otp"
                                        maxLength="6"
                                        name="otp"
                                        id='email'
                                        required
                                        className=' border border-gray-400 text-center w-full h-16 hover:border-gray-800 focus:outline-none px-5'
                                        onChange={(e) => setMyotp(e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-200"
                                >
                                    Verify Now
                                </button>
                            </div>
                        </>) : null


                    }



                    {
                        passwordInput ? (<>
                            <label
                                htmlFor="email">
                                New Password
                                <span
                                    className='text-red-900'>
                                    *
                                </span>
                            </label>
                            <input
                                type="password"
                                name="newpassword"
                                id='newpassword'
                                required
                                className=' border border-gray-400 w-full h-16 hover:border-gray-800 focus:outline-none px-5'
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <label
                                className='mt-5'
                                htmlFor="email">
                                Confarm Password
                                <span
                                    className='text-red-900 '>
                                    *
                                </span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                id='password'
                                required
                                className=' border border-gray-400 w-full h-16 hover:border-gray-800 focus:outline-none px-5'
                                onChange={(e) => setConformPassword(e.target.value)}
                            />
                            <button
                                onClick={handleSetNewPassword}
                                className=' border border-gray-400 w-full h-16 px-5 bg-black text-white my-5  uppercase' >
                                Continue
                            </button>
                        </>) : null
                    }

                    {
                        myShowState ? (<MyMsges myShowMsg={myShowMsg} myShowRed={myShowRed} />) : null
                    }

                </div>

            </div>
        </div>
    )
}

export default ForgetPasswordPage
