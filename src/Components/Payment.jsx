// src/components/Payment.jsx
import React from "react";
import toast from "react-hot-toast";

export default function Payment({ amount }) {
  const handlePayment = () => {
    toast.success(
      `Payment of $${amount} successful! (Sorry Comming soon This feature, so try this number send and send Screenshot 03143638733(JazCash))`
    );
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-sm mx-auto my-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Total Amount: ${amount}</h3>
      <button
        onClick={handlePayment}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
      >
        Pay Now
      </button>
    </div>
  );
}
