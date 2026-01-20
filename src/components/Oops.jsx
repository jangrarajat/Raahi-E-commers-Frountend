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
            <button className=' p-1 px-6 rounded-sm  text-red-400 active:scale-95 duration-300 mt-4  border font-thin  border-red-400'
            onClick={relodPage}
            >Try again</button>
        </div>
    )
}

export default Oops
