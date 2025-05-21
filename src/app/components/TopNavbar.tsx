"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function TopBar() {
    const [isOpen, setIsOpen] = useState(false);

    // Dropdown menu animation variants
    const menuVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut",
            },
        },
    };

    // Menu item hover animation variants
    const itemVariants = {
        rest: {
            scale: 1,
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            transition: {
                duration: 0.2,
            },
        },
        hover: {
            scale: 1.02,
            backgroundColor: "rgba(106, 13, 173, 0.1)",
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <header
            className="w-full bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-b-[2rem] shadow-[0_4px_12px_rgba(106,13,173,0.7)] fixed top-0 left-0 z-50"
        >
            <div className="container mx-auto flex items-center justify-between h-20 px-6">
                {/* Left: Logo */}
                <motion.div
                    className="flex items-center gap-2"
                    variants={{
                        rest: {
                            rotate: 0,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                                duration: 0.3,
                            },
                        },
                        hover: {
                            rotate: 10,
                            scale: 1.2,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                                duration: 0.3,
                            },
                        },
                    }}
                    initial="rest"
                    whileHover="hover"
                >
                    <Link href="/dashboard">
                        <Image src="/logo.png" alt="Digimatic Logo" width={32} height={32} />
                    </Link>
                </motion.div>

                {/* Center: Search Bar */}
                <div className="flex-1 px-8 hidden md:flex justify-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input input-bordered w-full max-w-md bg-[rgba(255,255,255,0.2)] placeholder-gray-700 text-[#6A0DAD] border-[rgba(255,215,0,0.4)] backdrop-blur-sm shadow-sm"
                    />
                </div>

                {/* Right: Profile */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                >
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn m-1 bg-transparent flex items-center gap-2 border-none shadow-[0_4px_12px_rgba(106,13,173,0.3)]"
                    >
                        <div className="w-12 rounded-full">
                            <Image src="/logo.png" alt="Profile" width={30} height={30} />
                        </div>
                        <span className="text-[#6A0DAD] font-semibold hidden md:inline text-lg">Joshua</span>
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.ul
                                tabIndex={0}
                                className="dropdown-content menu bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-box z-1 w-52 p-2 shadow-[0_4px_12px_rgba(106,13,173,0.7)] text-[#6A0DAD]"
                                variants={menuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <motion.li variants={itemVariants} whileHover="hover" initial="rest">
                                    <a>Request Profile Change</a>
                                </motion.li>
                                <motion.li variants={itemVariants} whileHover="hover" initial="rest">
                                    <a>Request Password Change</a>
                                </motion.li>
                                <motion.li variants={itemVariants} whileHover="hover" initial="rest">
                                    <a className="text-red-500">Logout</a>
                                </motion.li>
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}