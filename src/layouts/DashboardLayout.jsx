// src/layouts/DashboardLayout.jsx
import React from "react";
import Navbar from "../Components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-20 px-6">{children}</main>
    </div>
  );
}
