import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AccountMenuBar from '../../components/AccountMenuBar'
import ChangePasswordError from '../../components/msg/ChangePasswordError'
import axios from 'axios'
import ButtonLoader from '../../components/loader/ButtonLoader'
import { CircleCheck } from 'lucide-react'

function ChangePassword() {
    const navigate = useNavigate()
    const { user, logout, logoutLoading } = useAuth()

    const [msgError, setMsgError] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [msgSuccess, setMsgSuccess] = useState(false)
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [changePasswordLoading, setChangePasswordLoading] = useState(false)

    useEffect(() => {
        if (user === null) return navigate('/')
    }, [])

    function setError(msg) {
        setMsgError(true)
        setErrorMsg(msg)
        setChangePasswordLoading(false)
    }

    function unSetSuccessMsg() {
        setTimeout(() => {
            setMsgSuccess(false)
        }, 5000)
    }


    const handleChangePassword = async () => {
        setChangePasswordLoading(true)


        if (oldPassword === "" || newPassword === "" || confirmNewPassword === "") return setError("All fields are requried")
        if (newPassword !== confirmNewPassword) return setError("New password & conform password are not same")

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/user/resetPassword`, { oldPassword, newPassword }, { withCredentials: true })
           
            setMsgSuccess(true)
            unSetSuccessMsg()
        } catch (error) {
            console.log("error in change password" , error.response?.data?.message)
            setError(error.response?.data?.message)
            if (error.response.data.message === "jwt expired" ) {
                try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/refreshExpiredToken`, {}, { withCredentials: true })
                    console.log(res)
                   handleChangePassword()    
                } catch (error) {
                    logout()
                    console.log("error in refreshExpiredtoken", error.response.data.message)
                    throw error
                } 
            }
        } finally {
            setChangePasswordLoading(false)
        }


    }




    return (
        <div className="w-full min-h-screen bg-white flex flex-col md:flex-row ">
            <AccountMenuBar />
            <div className=' w-full  md:w-[70%] min-h-[100vh] p-5 '>
                <div>
                    <h1 className='text-5xl font-extrabold mb-28  text-start  mt-14 tracking-tighter uppercase leading-9'>
                        Change <br /> password
                    </h1>
                </div>
                <div className=''>
                    <div className='flex  flex-col gap-2'>
                        {msgSuccess ? (<>
                            <div className="text-xs font-light  w-full md:w-[40%] h-16  flex gap-2 justify-center items-center px-5 uppercase bg-green-500 text-white">
                                <CircleCheck />    <h1 className=' flex flex-col text-center justify-center items-center'>   Password Changed successfull</h1>
                            </div></>) : null
                        }
                        <label htmlFor="currentPassword">Current Password <span className='text-red-900'>*</span></label>
                        <input type="password" name="currentPassword" id='currentPassword' className=' border border-gray-400 w-full md:w-[40%] h-16 hover:border-gray-800 focus:outline-none px-5'
                            onChange={(e) => setOldPassword(e.target.value)}
                        />

                        <label htmlFor="newPassword">New password <span className='text-red-900'>*</span></label>
                        <input type="password" name="newPassword" id='newPassword' className=' border border-gray-400 w-full md:w-[40%] h-16 hover:border-gray-800 focus:outline-none px-5'
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className='w-full md:w-[40%] text-gray-400 mb-9'>
                            8-25 characters only 1 number 1 uppercase 1 lowercase No spaces
                        </p>

                        <label htmlFor="confirmNewPassword">Confirm new password <span className='text-red-900'>*</span></label>
                        <input type="password" name="confirmNewPassword" id='confirmNewPassword' className=' border border-gray-400 w-full md:w-[40%] h-16 hover:border-gray-800 focus:outline-none px-5'
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />

                        {msgError ? (<ChangePasswordError setMsgError={setMsgError} errorMsg={errorMsg} setErrorMsg={setErrorMsg} />) : null}

                        {
                            changePasswordLoading ? (
                                <>
                                    <div className="border  border-gray-400 w-full md:w-[40%] h-16 hover:border-gray-800 focus:outline-none px-5 uppercase bg-black text-white flex justify-center items-center">
                                        <ButtonLoader />
                                    </div>
                                </>
                            )
                                : (
                                    <button className=' border border-gray-400 w-full md:w-[40%] h-16 hover:border-gray-800 focus:outline-none px-5 uppercase bg-black text-white hover:bg-gray-900'
                                        onClick={handleChangePassword}
                                    >
                                        Change password
                                    </button>
                                )
                        }



                    </div>
                </div>

            </div>

        </div>
    )
}

export default ChangePassword
