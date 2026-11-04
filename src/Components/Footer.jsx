import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-white pt-13 sm:pt-12 pb-3  ">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-red-600">TailorPro</h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base">
            Your trusted online stitching and tailoring service.
          </p>
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-red-500">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-red-600">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm sm:text-base">
            <li className="hover:text-red-500 cursor-pointer">Home</li>
            <li className="hover:text-red-500 cursor-pointer">Order</li>
            <li className="hover:text-red-500 cursor-pointer">Measurements</li>
            <li className="hover:text-red-500 cursor-pointer">Portfolio</li>
            <li className="hover:text-red-500 cursor-pointer">Dashboard</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-red-600">Contact</h3>
          <p className="mt-3 text-gray-400 text-sm sm:text-base flex items-center justify-center md:justify-start gap-2">
            <FaEnvelope /> <span className="text-white">alishan@.com</span>
          </p>
          <p className="text-gray-400 text-sm sm:text-base mt-1 flex items-center justify-center md:justify-start gap-2">
            <FaPhone /> <span className="text-white">+92 3143638733</span>
          </p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-gray-500 text-sm sm:text-base mt-10 border-t border-gray-700 pt-5">
        © 2025 TailorPro. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
