import React from 'react'

function Home() {
  return (
    <div className='w-full min-h-96  '>
      <div
        className="h-[90vh] bg-cover bg-center flex items-center pl-10"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/12700578/pexels-photo-12700578.jpeg')" }}
      >
        <div className="text-white">
          <h1 className="text-5xl font-bold">Style That Speaks</h1>
          <p className="mt-4 text-xl">Discover the latest fashion</p>
          <button className='bg-white text-black w-60 h-20 hover:scale-105 duration-300'>
            Shop Now
          </button>
        </div>
      </div>

      <div id='part2' className='w-full min-h-56 relative'>
        <div className='w-full h-20  md:px-10 flex items-center '>
          <h2 className='text-2xl font-serif  uppercase' >[Ladies]</h2>
        </div>

        <div className='w-full flex flex-col md:flex-row justify-center'>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center  cursor-pointer'
            style={{ backgroundImage: "url('https://res.cloudinary.com/drrj8rl9n/image/upload/v1763747859/WhatsApp_Image_2025-11-21_at_18.12.08_f5f69226_bdta3o.jpg')" }}
          >

          </div>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center cursor-pointer'
            style={{ backgroundImage: "url('https://res.cloudinary.com/drrj8rl9n/image/upload/v1763747860/Gemini_Generated_Image_17w7sy17w7sy17w7_kua2hd.jpg')" }}
          >

          </div>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center cursor-pointer'
            style={{ backgroundImage: "url('https://res.cloudinary.com/drrj8rl9n/image/upload/v1763747861/Gemini_Generated_Image_4ejukw4ejukw4eju_lbfa1j.jpg')" }}
          >

          </div>
        </div>
      </div>


      <div id='part3' className='w-full min-h-56 relative'>
        <div className='w-full h-20 md:px-10 flex items-center '>
          <h2 className='text-2xl font-serif  uppercase' >[man]</h2>
        </div>

        <div className='w-full flex flex-col md:flex-row justify-center'>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center  cursor-pointer'
            style={{ backgroundImage: "url('https://i.pinimg.com/1200x/2c/56/88/2c56888db490f5ec5714102f8e9f924e.jpg')" }}
          >

          </div>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center cursor-pointer'
            style={{ backgroundImage: "url('https://i.pinimg.com/1200x/7d/07/ea/7d07ea532daa1455e71658ebaf930ba8.jpg')" }}
          >

          </div>
          <div className='w-[100%] md:w-[30%] h-[80vh] bg-cover bg-center cursor-pointer'
            style={{ backgroundImage: "url(' https://i.pinimg.com/1200x/a7/53/ab/a753abe7812bb46d028ec7f5eeb0960b.jpg')" }}
          >

          </div>
        </div>
      </div>

    </div>
  )
}

export default Home
