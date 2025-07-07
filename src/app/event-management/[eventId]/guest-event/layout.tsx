import React from "react";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('GuestEventLayout rendered');
  return <>{children}</>;
}