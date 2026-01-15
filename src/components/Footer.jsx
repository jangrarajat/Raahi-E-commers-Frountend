import React from "react";
import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="w-full bg-white mt-10 overflow-x-hidden">

      {/* Top Grid */}
      <div className="w-full flex flex-col md:flex-row justify-between px-6 md:px-16 py-10 gap-10">

        <ul className="flex flex-col gap-2">
          <b className="mb-2 uppercase">Shop</b>
          <Link className="hover:underline uppercase" to="/product/Women">Women</Link>
          <Link className="hover:underline uppercase" to="/product/Men">Men</Link>
          <Link className="hover:underline uppercase" to="/product/Kids">kids</Link>
          <a className="hover:underline uppercase">Accessories</a>
        </ul>

        <ul className="flex flex-col gap-2">
          <b className="mb-2 uppercase">Corporate Info</b>
          <a className="hover:underline uppercase">Career at H&M</a>
          <a className="hover:underline uppercase">About R&M group</a>
          <a className="hover:underline uppercase">Sustainability H&M Group</a>
          <a className="hover:underline uppercase">Press</a>
        </ul>

        <ul className="flex flex-col gap-2">
          <b className="mb-2 uppercase">Help</b>
          <a className="hover:underline uppercase">Customer Service</a>
          <a className="hover:underline uppercase">Legal & privacy</a>
          <a className="hover:underline uppercase">Contact</a>
          <a className="hover:underline uppercase">Secure shopping</a>
        </ul>

        <ul className="flex flex-col gap-2">
          <b className="mb-2 uppercase">Other</b>
          <Link to='/account/setting' className="hover:underline uppercase">Settings</Link>
          <a className="hover:underline uppercase">About</a>
          <a className="hover:underline uppercase">Contact</a>
          <Link to='/account/orders' className="hover:underline uppercase">Orders</Link>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="w-full px-6 md:px-16 pb-10">
        <img
          src="https://res.cloudinary.com/drrj8rl9n/image/upload/v1763724939/Gemini_Generated_Image_9y17m59y17m59y17_aunkz4.jpg"
          alt="logo"
          className="w-20 mb-5"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <p className="text-sm md:text-base">
            The content of this site is copyright-protected and is the property
            of R & M .
          </p>

          <div className="flex gap-4">
            <a href="#">
              <Instagram />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
