import React from "react";

function ServiceCard({ title, desc, icon }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition duration-300">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
