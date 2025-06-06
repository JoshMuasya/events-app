"use client";

import { motion } from "framer-motion";
import { FiUsers, FiCalendar, FiCheckSquare, FiGift, FiDollarSign } from "react-icons/fi";
import Link from "next/link";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    // Mock data (replace with API fetch)
    const stats = [
        {
            title: "Users",
            icon: <FiUsers />,
            stats: [
                { value: "250", label: "Total Users" },
                { value: "180", label: "Active Users" },
                { value: "25", label: "New Users" },
            ],
            chartData: [
                { name: "Active", value: 180 },
                { name: "Inactive", value: 70 },
            ],
            chartType: "pie",
            href: "/users",
        },
        {
            title: "Events",
            icon: <FiCalendar />,
            stats: [
                { value: "12", label: "Upcoming Events" },
                { value: "45", label: "Total Events" },
                { value: "8", label: "This Month" },
            ],
            chartData: [
                { month: "Jan", events: 5 },
                { month: "Feb", events: 7 },
                { month: "Mar", events: 6 },
                { month: "Apr", events: 8 },
                { month: "May", events: 10 },
            ],
            chartType: "line",
            href: "/event-management",
        },
        {
            title: "RSVPs",
            icon: <FiCheckSquare />,
            stats: [
                { value: "320", label: "Total RSVPs" },
                { value: "85%", label: "Attendance Rate" },
                { value: "50", label: "Pending RSVPs" },
            ],
            chartData: [
                { name: "Attending", value: 272 },
                { name: "Not Attending", value: 32 },
                { name: "Pending", value: 16 },
            ],
            chartType: "pie",
            href: "/rsvps",
        },
        {
            title: "Gifts",
            icon: <FiGift />,
            stats: [
                { value: "150", label: "Total Gifts" },
                { value: "$2,500", label: "Gift Value" },
                { value: "20", label: "New Gifts" },
            ],
            chartData: [
                { category: "Physical", value: 60 },
                { category: "Gift Cards", value: 45 },
                { category: "Other", value: 45 },
            ],
            chartType: "bar",
            href: "/gifts",
        },
        {
            title: "Money Contribution",
            icon: <FiDollarSign />,
            stats: [
                { value: "$10,000", label: "Total Contributions" },
                { value: "$1,200", label: "This Week" },
                { value: "50%", label: "Goal Progress" },
            ],
            chartData: [
                { day: "1", amount: 200 },
                { day: "7", amount: 400 },
                { day: "14", amount: 300 },
                { day: "21", amount: 500 },
                { day: "30", amount: 1200 },
            ],
            chartType: "line",
            href: "/money-contribution",
        },
    ];

    // Chart colors
    const COLORS = ["#6A0DAD", "#FFD700", "#F7E7CE"];

    // Widget animation variants
    const widgetVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
        hover: {
            scale: 1.05,
            boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
            transition: { duration: 0.2 },
        },
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold text-[#6A0DAD] mb-6">Dashboard</h1>
            <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 shadow-[0_4px_12px_rgba(106,13,173,0.3)] min-w-[250px]"
                        variants={widgetVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={stat.href} className="block">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl text-[#6A0DAD]">{stat.icon}</span>
                                <h2 className="text-lg font-semibold text-[#6A0DAD]">{stat.title}</h2>
                            </div>
                            <div className="space-y-2 mb-3">
                                {stat.stats.map((s, i) => (
                                    <div key={i}>
                                        <p className="text-lg font-bold text-[#6A0DAD]">{s.value}</p>
                                        <p className="text-xs text-[#6A0DAD] opacity-80">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    {stat.chartType === "pie" ? (
                                        <PieChart>
                                            <Pie
                                                data={stat.chartData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={40}
                                                fill="#6A0DAD"
                                            >
                                                {stat.chartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    ) : stat.chartType === "line" ? (
                                        <LineChart data={stat.chartData}>
                                            <XAxis dataKey={stat.title === "Events" ? "month" : "day"} hide />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Line type="monotone" dataKey={stat.title === "Events" ? "events" : "amount"} stroke="#6A0DAD" />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={stat.chartData}>
                                            <XAxis dataKey="category" hide />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#6A0DAD" />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}