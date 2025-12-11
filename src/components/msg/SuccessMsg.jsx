import { CircleCheck, MoveDown } from 'lucide-react'
import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'

function SuccessMsg() {
    const { setRegistrationSuccessMsg } = useAuth()

    useEffect(() => {
        setTimeout(() => {
            setRegistrationSuccessMsg(false)
        }, 20000)
    }, [])


    return (
        <div className='bg-green-400 flex my-2 flex-col justify-center items-center text-lg text-black  px-4 py-3 '

        >
            <span className='flex items-center text-sm'><CircleCheck size={13}/>   Successfull </span>
            <span className='text-xs flex text-center'>
                <MoveDown size={15} /> Click on back to Signup
            </span>

        </div>
    )
}

export default SuccessMsg
