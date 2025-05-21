"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiHome, FiUser, FiSettings, FiLogOut, FiGlobe, FiUsers, FiCalendar, FiCheckSquare, FiGift, FiDollarSign } from "react-icons/fi";
import Link from "next/link";

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

    // Sidebar animation variants
    const sidebarVariants = {
        collapsed: {
            width: 64,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.3,
            },
        },
        expanded: {
            width: 200,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.3,
            },
        },
    };

    // Text animation variants for link names
    const textVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
    };

    // Link hover animation variants
    const linkVariants = {
        rest: {
            scale: 1,
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            transition: { duration: 0.2 },
        },
        hover: {
            scale: 1.05,
            backgroundColor: "rgba(106, 13, 173, 0.1)",
            transition: { duration: 0.2 },
        },
    };

    const links = [
        { name: "Dashboard", icon: <FiHome />, href: "/dashboard" },
        { name: "Website Home", icon: <FiGlobe />, href: "/" },
        { name: "Manage Users", icon: <FiUsers />, href: "/users" },
        { name: "Events", icon: <FiCalendar />, href: "/events" },
        { name: "RSVPs", icon: <FiCheckSquare />, href: "/rsvps" },
        { name: "Gifts", icon: <FiGift />, href: "/gifts" },
        { name: "Money Contribution", icon: <FiDollarSign />, href: "/money-contribution" },
        { name: "Logout", icon: <FiLogOut />, href: "/logout" },
    ];

    return (
        <motion.div
            className="fixed top-20 left-0 h-[calc(100vh-80px)] bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.7)] z-40 flex flex-col items-center py-4"
            variants={sidebarVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
        >
            {/* Toggle Button */}
            <label className="btn btn-circle swap swap-rotate mb-6 bg-transparent border-none text-[#6A0DAD] hover:bg-[rgba(106,13,173,0.1)] shadow-[0_4px_12px_rgba(106,13,173,0.3)]">
                <input
                    type="checkbox"
                    checked={isExpanded}
                    onChange={() => setIsExpanded(!isExpanded)}
                    aria-label="Toggle sidebar"
                />
                {/* Hamburger icon */}
                <FiMenu className="swap-off" size={24} />
                {/* Close icon */}
                <FiX className="swap-on" size={24} />
            </label>

            {/* Links */}
            <ul className="flex-1 w-full flex flex-col gap-2">
                {links.map((link, index) => (
                    <motion.li
                        key={index}
                        variants={linkVariants}
                        initial="rest"
                        whileHover="hover"
                        className="w-full"
                    >
                        <Link
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-2 text-[#6A0DAD] font-semibold"
                        >
                            <span className="text-xl">{link.icon}</span>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        variants={textVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="whitespace-nowrap"
                                    >
                                        {link.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}