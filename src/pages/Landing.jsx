// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0f14] to-[#2E1D29] text-white flex flex-col relative overflow-hidden">
      {/* 🌟 Floating glow effects */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#F3A953]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F3A953]/5 rounded-full blur-3xl animate-pulse"></div>

      {/* ✅ Navbar */}
      <header className="w-full py-5 px-8 flex justify-between items-center border-b border-white/10 backdrop-blur-sm z-20">
        <h1 className="text-lg md:text-xl font-bold tracking-wide text-[#F3A953] hover:scale-105 hover:text-[#ffbf69] transition-all duration-300 cursor-default">
          “If Others Can Do, Why Can’t I?”
        </h1>
      </header>

      {/* ✅ Hero Section */}
      <main className="flex flex-1 items-center justify-center px-10 md:px-20 relative z-10">
        <div className="grid md:grid-cols-2 items-center gap-10">
          {/* 📝 Left Section - Text */}
          <div className="space-y-5 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-[0_0_15px_rgba(243,169,83,0.3)]">
              Hi There, I’m <br />
              <span className="text-[#F3A953] hover:text-[#ffbf69] transition-all duration-300 cursor-pointer">
                Lloyd Lato
              </span>
            </h2>
            <p className="text-lg md:text-xl font-light text-[#F3A953] tracking-wide">
              Bachelor of Science in Information Technology
            </p>

            <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
              As a BSIT student, I’m driven by a strong passion for technology
              and creativity. I believe that every line of code brings me one
              step closer to achieving my dreams. Through dedication and
              continuous learning, I strive to become a skilled web developer
              who can turn ideas into impactful digital solutions. My goal is to
              inspire others — proving that with hard work, perseverance, and
              faith, anyone can build a successful future in tech.
            </p>

            {/* 💫 Button with hover animation */}
            <div className="mt-8">
              <Link
                to="/students"
                className="border border-[#F3A953] px-8 py-3 text-[#F3A953] rounded-md font-semibold 
                hover:bg-[#F3A953] hover:text-black hover:shadow-[0_0_20px_#F3A953] transition-all duration-300 transform hover:scale-105"
              >
                🚀 View Works
              </Link>
            </div>
          </div>

          {/* 🖼 Right Section - Image with hover */}
          <div className="flex justify-center md:justify-end relative group">
            <div className="absolute inset-0 bg-[#F3A953]/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <img
              src="/lloyd.jpg"
              alt="Lloyd Lato"
              className="w-80 h-80 object-cover rounded-2xl shadow-[0_0_30px_rgba(243,169,83,0.4)] border-4 border-[#F3A953] transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(243,169,83,0.6)]"
            />
          </div>
        </div>
      </main>

      
    </div>
  );
}
