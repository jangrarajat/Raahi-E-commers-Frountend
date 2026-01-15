import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function AccountMenuBar() {
    const { user, logout, logoutLoading } = useAuth()


    return (
        <div className=' hidden w-full  md:w-[30%] min-h-[60vh] font-sans p-10 md:flex flex-col gap-5 '>
            <div>
                <div className='mb-5'>
                    <h1>Welcome , {user?.email} </h1>
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
                            <Link
                                to="/account/dashboard"
                                className=' uppercase font-normal text-3xl hover:underline'>
                                dashboard
                            </Link>
                        </>
                    ) : null
                }
            </div>
            <div className='my-12'>
                <ul className=' uppercase text-2xl font-semibold flex flex-col '>
                    <Link to="/user" className=' hover:underline  my-2 font-bold'>
                        Account & Settings
                    </Link>

                    <Link to="/account/orders" className=' hover:underline  my-2 cursor-pointer font-normal'>
                        Orders
                    </Link>
                    <Link to="/account/setting" className=' hover:underline  my-2 cursor-pointer font-normal'>
                        Account settings
                    </Link>
                    <li className=' hover:underline  my-2 cursor-pointer font-normal'>R&M Membership</li>
                </ul>
            </div>
            <div>
                <button className=' underline flex flex-row '
                    onClick={logout}
                >
                    SIGN OUT {logoutLoading ? (<><ButtonLoader /></>) : null}
                </button>
            </div>

        </div>
    )
}

export default AccountMenuBar
