"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from 'framer-motion';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast.success("Login successful");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card w-full lg:w-1/3 mx-auto bg-transparent border-none shadow-2xl shadow-purple-500/50 flex flex-col">
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="card-body text-center bg-base-100/10"
            >
                <h1 className="text-2xl font-bold text-purple-700">Login</h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="card-body bg-base-100/10 py-10"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto space-y-6 p-4">
                    {/* Email Field */}
                    <div className="form-control">
                        <label className="label text-sm font-bold text-purple-700" htmlFor="email">
                            Email
                        </label>
                        <label className="input input-bordered w-full text-purple-700 bg-purple-100">
                            <Mail className="mr-2 w-5 h-5 opacity-60" />
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="bg-transparent flex-grow text-sm"
                                {...register("email")}
                            />
                        </label>
                        {errors.email && (
                            <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-control">
                        <label className="label text-sm font-bold text-purple-700" htmlFor="password">
                            Password
                        </label>
                        <label className="input input-bordered w-full text-purple-700 bg-purple-100">
                            <Lock className="mr-2 w-5 h-5 opacity-60" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-transparent flex-grow text-sm"
                                {...register("password")}
                            />
                        </label>
                        {errors.password && (
                            <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-warning w-full text-purple-700 font-semibold text-base shadow-lg hover:bg-yellow-400 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Logging In..." : "Log In"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
