
import { AuthProvider } from "@/lib/AuthContext";
import React from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className=""
            >
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}