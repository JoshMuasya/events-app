
import { AuthProvider } from "@/lib/AuthContext";
import React from "react";
import TopNavbar from "../components/TopNavbar";
import SideBar from "../components/SideBar";

export default function EventLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <AuthProvider>
                <TopNavbar />
                <SideBar />
                {children}
            </AuthProvider>
        </body>
    )
}