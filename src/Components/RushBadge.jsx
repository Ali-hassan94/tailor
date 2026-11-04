// src/components/RushBadge.jsx
import React from "react";

export default function RushBadge({ message }) {
  return (
    <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
      {message}
    </span>
  );
}
