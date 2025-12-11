import React from "react";
import { Link } from "react-router-dom";


function Home() {
  const ladiesHighlights = [
    "https://i.pinimg.com/736x/86/57/97/8657978ee113d8a786501cceff4dc049.jpg",
    "https://i.pinimg.com/736x/ba/f2/6c/baf26cb160347879c6bd207fb020fb08.jpg",
    "https://i.pinimg.com/1200x/dd/de/8f/ddde8f62b46f1b768cc1a5ea1b4553a5.jpg",
  ];

  const manHighlights = [
    "https://i.pinimg.com/1200x/2e/c7/e5/2ec7e5fbcff4b6f8cd8983d54aa8e2a1.jpg",
    "https://i.pinimg.com/736x/38/6a/df/386adf6362f73ff6676bc0c6626d779c.jpg",
    "https://i.pinimg.com/736x/8e/e1/b4/8ee1b48a823c94db993235cb302dab3a.jpg",
  ];

  const kidsHighlights = [
    "https://res.cloudinary.com/drrj8rl9n/image/upload/v1763790766/WhatsApp_Image_2025-11-21_at_18.46.57_f655eb98_vbd1bq.jpg",
    "https://res.cloudinary.com/drrj8rl9n/image/upload/v1763791167/Gemini_Generated_Image_r3ou6rr3ou6rr3ou_tq4d0t.png",
    "https://res.cloudinary.com/drrj8rl9n/image/upload/v1763791391/Gemini_Generated_Image_4ylece4ylece4yle_sygzpj.png",
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden">

      {/* HERO SECTION */}
      <div
        className="h-[80vh] bg-cover bg-center flex items-center px-6"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/12700578/pexels-photo-12700578.jpeg')",
        }}
      >
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold">Style That Speaks</h1>
          <p className="mt-4 text-lg md:text-xl">Discover the latest fashion</p>
          <Link to='/product/all'>
            <button className="bg-white text-black w-40 h-14 mt-4 hover:scale-105 duration-300">
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      {/* LADIES SECTION */}
      <div className="w-full mt-10">
        <div className="w-full h-20 px-6 md:px-10 flex items-center">
          <h2 className="text-2xl font-serif uppercase">[Ladies]</h2>
          <p className="uppercase ml-4">highlights</p>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-center  px-4 overflow-hidden">
          {ladiesHighlights.map((URL, i) => (
            <div
              key={i}
              className="w-full md:w-1/3 h-[100vh] bg-cover bg-center cursor-pointer "
              style={{ backgroundImage: `url('${URL}')` }}
            ></div>
          ))}
        </div>
      </div>

      {/* MEN SECTION */}
      <div className="w-full mt-10">
        <div className="w-full h-20 px-6 md:px-10 flex items-center">
          <h2 className="text-2xl font-serif uppercase">[Man]</h2>
          <p className="uppercase ml-4">highlights</p>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-center  px-4 overflow-hidden">
          {manHighlights.map((URL, i) => (
            <div
              key={i}
              className="w-full md:w-1/3 h-[70vh] bg-cover bg-center cursor-pointer "
              style={{ backgroundImage: `url('${URL}')` }}
            ></div>
          ))}
        </div>
      </div>


      {/* KIDS SECTION */}
      <div className="w-full mt-10">
        <div className="w-full h-20 px-6 md:px-10 flex items-center">
          <h2 className="text-2xl font-serif uppercase">[Kids]</h2>
          <p className="uppercase ml-4">highlights</p>
        </div>

        <div className="w-full  flex flex-col md:flex-row justify-center  px-4 overflow-hidden">
          {kidsHighlights.map((URL, i) => (
            <div
              key={i}
              className="w-full md:w-1/3 h-[70vh] bg-cover bg-center cursor-pointer "
              style={{ backgroundImage: `url('${URL}')` }} >

            </div>
          ))}
        </div>
      </div>


    </div>
  );
}

export default Home;
