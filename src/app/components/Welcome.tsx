"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function WelcomePage() {
    return (
        <div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto bg-transparent border-none shadow-2xl shadow-purple-500/50 flex flex-col card">
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="card-body text-center bg-base-100/10 py-8 sm:py-10"
            >
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-700">
                    Welcome
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9 }}
                className="card-body text-center bg-base-100/10 py-8 sm:py-10"
            >
                <p className="text-sm sm:text-base md:text-lg font-bold text-purple-700">
                    Plan with Elegance, Celebrate with Twilight Luxe!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9 }}
                className="card-body text-center bg-base-100/10 py-8 sm:py-10"
            >
                <div className="flex justify-center items-center">
                    <Link
                        href="/login"
                        passHref
                        className="btn btn-warning text-purple-700 font-semibold text-sm sm:text-base md:text-lg shadow-lg hover:bg-yellow-400 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}