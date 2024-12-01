import React from 'react'

import {
  Camera,
  Video,
  Utensils,
  Cake,
  CalendarCheck,
  Gift,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div id='hero' className="relative h-screen w-full flex items-center justify-center flex-col">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        poster="/hero-image.jpg" // Fallback image
      >
        <source src="/to-add-video.mp4" type="video/mp4" />
        {/* Fallback message for unsupported browsers */}
        <img
          src="/hero-image.jpg"
          alt="Fallback"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Logo, Company Name, and Slogan */}
      <div className="relative text-white z-10 p-6 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-24 h-auto mb-4" /> {/* Adjust logo size as needed */}
        <h1
          className="text-xl md:text-3xl font-bold mb-2"
          style={{
            color: "#FFFFFF",
            textShadow: "2px 2px 4px #FAA722, 0 0 25px #FAA722, 0 0 5px #FAA722",
            fontFamily: "'Playfair Display', serif"
          }}
        >
          TWILIGHT LUXE CREATIONS
        </h1> {/* White with golden shadow for the company name */}
        <p
          className="text-sm md:text-lg italic mb-4"
          style={{
            color: "#FAA722",
            fontFamily: "'Lora', serif"  // For a classic, elegant look. Or use Raleway for a more modern feel
          }}
        >
          Crafting Perfect Events with Luxe Precision
        </p> {/* Gold for the slogan */}
      </div>


      <div className="relative text-white z-10 bg-[#1a0026] bg-opacity-80 p-12 rounded-xl m-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-20 py-6 md:py-16 px-3 md:px-12">
          {[
            { title: "Photography", Icon: Camera },
            { title: "Videography", Icon: Video },
            { title: "Catering", Icon: Utensils },
            { title: "Baking", Icon: Cake },
            { title: "E-RSVP System", Icon: CalendarCheck },
            { title: "Gift Management", Icon: Gift },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center px-7"
            >
              <item.Icon className="mb-2" style={{ width: "4vw", height: "4vw" }} />
              <p className="text-sm md:text-lg lg:text-xl font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
