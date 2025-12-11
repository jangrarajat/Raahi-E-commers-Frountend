import { CircleX } from 'lucide-react'
import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

function FailedMsf() {
    const { setRegistrationFailedMsg, registrationErrorMsg, setRegistrationErrorMsg, loginErrorMsg, setLoginFailedMsg, setLoginErrorMsg } = useAuth()

    useEffect(() => {
        setTimeout(() => {
            setRegistrationFailedMsg(false)
            setRegistrationErrorMsg("")
            setLoginFailedMsg(false)
            setLoginErrorMsg("")
        }, 20000)
    }, [])


    return (
        <div className='bg-red-500 my-2 flex flex-col justify-center items-center text-lg text-black  px-4 py-1 '

        >
            <span className=' flex justify-center items-center text-sm'> <CircleX size={13} />  Failed</span>
            <span>{registrationErrorMsg} {loginErrorMsg} </span>

        </div>
    )
}

export default FailedMsf
