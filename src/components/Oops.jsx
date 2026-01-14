import React from 'react'


function Oops() {
    function relodPage(e){
        e.preventDefault()
        window.location.reload()
    }
    return (
        <div className="w-full h-[100vh] flex flex-col justify-center items-center ">
            <h1 className="font-sans text-3xl text-red-700">Oops! </h1>
            <p className="text-red-300">Something went wrong.</p>
            <button className='bg-gradient-to-r from-blue-600 to-blue-400 p-1 px-6 rounded-lg hover:scale-105 duration-300 active:scale-90 text-white mt-4 shadow-md shadow-black'
            onClick={relodPage}
            >Try again</button>
        </div>
    )
}

export default Oops
