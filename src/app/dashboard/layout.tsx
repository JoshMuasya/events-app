
import { AuthProvider } from "@/lib/AuthContext";
import React from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <AuthProvider>
                {children}
            </AuthProvider>
        </body>
    )
}