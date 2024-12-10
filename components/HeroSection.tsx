"use client"

import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import gsap from 'gsap'

const HeroSection = () => {
    const servicesButtonRef = useRef<HTMLButtonElement>(null);
    const contactButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const servicesButton = servicesButtonRef.current;
        const contactButton = contactButtonRef.current;

        const setupButtonAnimation = (button: HTMLButtonElement | null) => {
            if (button) {
                const originalBackground = button.style.background;
                const originalOpacity = button.style.opacity;
                const originalTextColor = button.style.color;

                const handleMouseEnter = () => {
                    gsap.to(button, {
                        background: 'linear-gradient(45deg, #2b193d 60%, #523048 70%, #e3b341 100%)',
                        boxShadow: '0 0 10px rgba(227, 179, 65, 0.5)',
                        scale: 1.2,
                        color: '#b7b161',
                        opacity: 1,
                        duration: 1.5,
                        ease: 'bounce.out'
                    });
                };

                const handleMouseLeave = () => {
                    gsap.to(button, {
                        background: originalBackground,
                        scale: 1,
                        color: originalTextColor,
                        opacity: originalOpacity,
                        boxShadow: 'none',
                        duration: 1,
                        ease: 'power2.in'
                    });
                };

                button.addEventListener('mouseenter', handleMouseEnter);
                button.addEventListener('mouseleave', handleMouseLeave);

                return () => {
                    button.removeEventListener('mouseenter', handleMouseEnter);
                    button.removeEventListener('mouseleave', handleMouseLeave);
                };
            }
        };

        const servicesCleanup = setupButtonAnimation(servicesButton);
        const contactCleanup = setupButtonAnimation(contactButton);

        return () => {
            servicesCleanup?.();
            contactCleanup?.();
        };
    }, []);

    return (
        <div id='hero' className="relative h-screen w-full flex items-start justify-center flex-col">
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
            <div className="absolute inset-0 bg-black bg-opacity-10 md:bg-opacity-50 from-black/100 via-black/75 to-black/0 bg-gradient-to-r left-0"></div>

            {/* Logo, Company Name, and Slogan */}
            <div className="relative text-white z-10 p-6 flex flex-col items-start justify-start w-full">
                <h1
                    className="text-xl md:text-3xl lg:text-6xl font-bold mb-2 md:mb-4 lg:mb-10"
                    style={{
                        color: "#FFFFFF",
                        textShadow: "2px 2px 4px #FAA722, 0 0 25px #FAA722, 0 0 5px #FAA722",
                        fontFamily: "'Playfair Display', serif"
                    }}
                >
                    TWILIGHT LUXE CREATIONS
                </h1> {/* White with golden shadow for the company name */}

                <h3 className="max-w-[35%] text-md md:text-xl lg:text-4xl text-start mx-auto ml-0 mb-2 md:mb-4 lg:mb-10">
                    "Where Every Detail Dances in Elegance—Discover the Art of Unforgettable Moments."
                </h3>

                <p
                    className="text-sm md:text-lg lg:text-3xl italic mb-2 md:mb-4 lg:mb-10"
                    style={{
                        color: "#FAA722",
                        fontFamily: "'Lora', serif"  // For a classic, elegant look. Or use Raleway for a more modern feel
                    }}
                >
                    Crafting Perfect Events with Luxe Precision
                </p> {/* Gold for the slogan */}
            </div>

            {/* Buttons */}
            <div className='flex flex-col md:flex-row justify-between z-10 align-middle items-start w-full md:w-[30%] px-5'>
                {/* Services */}
                <div className="relative">
                    <button
                        ref={servicesButtonRef}
                        className="relative px-4 py-2 bg-primary text-accent text-lg rounded-md overflow-hidden font-bold"
                    >
                        <Link href="/">Our Services</Link>
                    </button>
                </div>

                {/* Contact */}
                <div className="relative">
                    <button
                        ref={contactButtonRef}
                        className="relative px-4 py-2 bg-accent text-lg text-primary rounded-md overflow-hidden font-bold "
                    >
                        <Link href="/">Contact us</Link>
                    </button>
                </div>
            </div>

            {/* Top Gradient */}
            <div className='z-10 bg-sunken-circle fixed bottom-[8%] flex flex-col justify-center items-center align-middle w-full h-[10%] opacity-10'>
            </div>

            {/* Partners */}
            <div className='fixed bottom-0 z-10 flex flex-col md:flex-row justify-around items-center align-middle w-full bg-bright-purple h-[20%] text-accent font-black text-xl'>
                {/* Beyond 001 */}
                <div>
                    Beyond 001
                </div>

                {/* Wilhide Bakers */}
                <div>
                    Wilhide Bakers
                </div>

                {/* Digimatic Marketers */}
                <div>
                    Digimatic Marketers
                </div>
            </div>
        </div>
    )
}

export default HeroSection
