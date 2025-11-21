import React from 'react'
import { Instagram } from 'lucide-react'
function Footer() {
    return (
        <div className='w-full min-h-72  relative '>
            <div className='w-full min-h-72 gap-10 flex flex-col md:items-center md:flex-row  justify-between   '>
                <ul className='w-full h-full   flex flex-col items-start justify-center gap-1 mx-5 mb-5'>
                    <b className=' mb-2'>Shop</b>
                    <a href="#" className=' hover:underline uppercase '>Ladies</a>
                    <a href="#" className=' hover:underline uppercase '>Man</a>
                    <a href="#" className=' hover:underline uppercase '>Kids</a>
                    <a href="#" className=' hover:underline uppercase '>Accessories</a>
                </ul>
                <ul className='w-full h-full   flex flex-col items-start justify-center gap-1 mx-5 mb-5'>
                    <b className=' mb-2'>Corporate Info</b>
                    <a href="#" className=' hover:underline uppercase '>  Career at H&M</a>
                    <a href="#" className=' hover:underline uppercase '>About R&M group</a>
                    <a href="#" className=' hover:underline uppercase '>Sustainability H&M Group</a>
                    <a href="#" className=' hover:underline uppercase '>Press</a>
                </ul>
                <ul className='w-full h-full   flex flex-col items-start justify-center gap-1 mx-5 mb-5'>
                    <b className=' mb-2'>Help</b>
                    <a href="#" className=' hover:underline uppercase '>Customer Service</a>
                    <a href="#" className=' hover:underline uppercase '>Legal & privacy</a>
                    <a href="#" className=' hover:underline uppercase '>Contact</a>
                    <a href="#" className=' hover:underline uppercase '>Secure shopping</a>
                </ul>
                <ul className='w-full h-full   flex flex-col items-start justify-center gap-1 mx-5 mb-5'>
                    <b className=' mb-2'>Other</b>
                    <a href="#" className=' hover:underline uppercase '>Settings</a>
                    <a href="#" className=' hover:underline uppercase '>About</a>
                    <a href="#" className=' hover:underline uppercase '>Contect</a>
                    <a href="#" className=' hover:underline uppercase '>Readme More</a>
                </ul>
            </div>
            <div className='h-20 w-full'>
                <div >
                    <img src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763724939/Gemini_Generated_Image_9y17m59y17m59y17_aunkz4.jpg" alt="logo" className='w-20' />
                </div>
                <div className=' flex md:flex-row flex-col justify-between px-5 mb-5 pb-5' >
                    <p>
                        The content of this site is copyright-protected and is the property of R & M Hennes & Mauritz AB.
                    </p>
                    <ul className=' flex my-4'>
                        <a href=""><Instagram /></a>
                        <a href=""></a>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Footer
