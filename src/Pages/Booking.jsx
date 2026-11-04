// import React, { useState, useEffect } from "react";
// import Payment from "../Components/Payment";

// export default function Booking() {
//   const [bookingData, setBookingData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     service: "",
//     date: "",
//     clothType: "cotton",
//     complexity: "simple",
//     rush: false,
//   });

//   const [totalPrice, setTotalPrice] = useState(0);

//   // Price calculation
//   useEffect(() => {
//     let base = 0;
//     if (bookingData.clothType === "cotton") base = 20;
//     if (bookingData.clothType === "silk") base = 40;
//     if (bookingData.clothType === "linen") base = 30;

//     if (bookingData.complexity === "simple") base += 10;
//     if (bookingData.complexity === "moderate") base += 25;
//     if (bookingData.complexity === "complex") base += 45;

//     if (bookingData.rush) base += 30;

//     setTotalPrice(base);
//   }, [bookingData]);

//   const handleChange = e => {
//     const { name, value, type, checked } = e.target;
//     setBookingData(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:4000/api/bookings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ...bookingData, totalPrice }),
//       });

//       const data = await res.json();
//       if (!res.ok) return alert(data.message || "Booking failed");

//       alert("Booking saved successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Error making booking");
//     }
//   };

//   return (
//     <section className="max-w-3xl mx-auto py-16 px-6">
//       <h2 className="text-3xl text-center mb-6">Book Tailor Service</h2>

//       <form
//         onSubmit={handleSubmit}
//         className="bg-white shadow p-6 rounded-xl flex flex-col gap-4"
//       >
//         <input
//           name="name"
//           placeholder="Full Name"
//           value={bookingData.name}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         />
//         <input
//           name="email"
//           placeholder="Email"
//           value={bookingData.email}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         />
//         <input
//           name="phone"
//           placeholder="Phone"
//           value={bookingData.phone}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         />
//         <input
//           name="service"
//           placeholder="Service Required"
//           value={bookingData.service}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         />
//         <input
//           type="date"
//           name="date"
//           value={bookingData.date}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         />

//         <label>Cloth Type</label>
//         <select
//           name="clothType"
//           value={bookingData.clothType}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         >
//           <option value="cotton">Cotton</option>
//           <option value="silk">Silk</option>
//           <option value="linen">Linen</option>
//         </select>

//         <label>Stitching Complexity</label>
//         <select
//           name="complexity"
//           value={bookingData.complexity}
//           onChange={handleChange}
//           className="border p-3 rounded"
//         >
//           <option value="simple">Simple</option>
//           <option value="moderate">Moderate</option>
//           <option value="complex">Complex</option>
//         </select>

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             name="rush"
//             checked={bookingData.rush}
//             onChange={handleChange}
//           />
//           Rush Order (holiday)
//         </label>

//         <div className="font-bold text-lg">Total Price: ${totalPrice}</div>

//         <button
//           type="submit"
//           className="bg-sky-600 text-white rounded px-6 py-3"
//         >
//           Submit Booking
//         </button>
//       </form>

//       {totalPrice > 0 && <Payment amount={totalPrice} />}
//     </section>
//   );
// }

// import React, { useState, useEffect } from "react";
// import Payment from "../Components/Payment";
// import { motion } from "framer-motion";
// import AOS from "aos";
// import "aos/dist/aos.css";

// export default function Booking() {
//   const [bookingData, setBookingData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     service: "",
//     date: "",
//     clothType: "cotton",
//     complexity: "simple",
//     rush: false,
//   });

//   const [errors, setErrors] = useState({});
//   const [totalPrice, setTotalPrice] = useState(0);

//   useEffect(() => {
//     AOS.init({ duration: 800 });
//   }, []);

//   useEffect(() => {
//     let base = 0;
//     if (bookingData.clothType === "cotton") base = 20;
//     if (bookingData.clothType === "silk") base = 40;
//     if (bookingData.clothType === "linen") base = 30;

//     if (bookingData.complexity === "simple") base += 10;
//     if (bookingData.complexity === "moderate") base += 25;
//     if (bookingData.complexity === "complex") base += 45;

//     if (bookingData.rush) base += 30;

//     setTotalPrice(base);
//   }, [bookingData]);

//   const handleChange = e => {
//     const { name, value, type, checked } = e.target;
//     setBookingData(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//     if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     let newErrors = {};
//     Object.keys(bookingData).forEach(key => {
//       if (key !== "rush" && !bookingData[key].trim()) {
//         newErrors[key] = "This field is required";
//       }
//     });

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:4000/api/bookings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ...bookingData, totalPrice }),
//       });

//       const data = await res.json();
//       if (!res.ok) return alert(data.message || "Booking failed");

//       alert("Booking saved successfully!");
//       setBookingData({
//         name: "",
//         email: "",
//         phone: "",
//         service: "",
//         date: "",
//         clothType: "cotton",
//         complexity: "simple",
//         rush: false,
//       });
//       setErrors({});
//     } catch (err) {
//       console.error(err);
//       alert("Error making booking");
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-center justify-center py-16 px-6 bg-black">
//       <div className="w-full max-w-3xl">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-4xl md:text-5xl font-bold text-center mb-10 text-red-600"
//         >
//           Book Tailor Service
//         </motion.h2>

//         <motion.form
//           onSubmit={handleSubmit}
//           data-aos="fade-up"
//           className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 flex flex-col gap-5 shadow-lg border border-red-600"
//         >
//           {[
//             { name: "name", placeholder: "Full Name" },
//             { name: "email", placeholder: "Email" },
//             { name: "phone", placeholder: "Phone" },
//             { name: "service", placeholder: "Service Required" },
//             { name: "date", placeholder: "Date", type: "date" },
//           ].map(field => (
//             <motion.div
//               key={field.name}
//               animate={
//                 errors[field.name] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }
//               }
//               transition={{ duration: 0.4 }}
//               className="flex flex-col"
//             >
//               <input
//                 type={field.type || "text"}
//                 name={field.name}
//                 placeholder={field.placeholder}
//                 value={bookingData[field.name]}
//                 onChange={handleChange}
//                 className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
//               />
//               {errors[field.name] && (
//                 <span className="text-red-500 text-sm mt-1">
//                   {errors[field.name]}
//                 </span>
//               )}
//             </motion.div>
//           ))}

//           <label className="font-semibold text-red-600">Cloth Type</label>
//           <motion.select
//             whileFocus={{ scale: 1.03 }}
//             name="clothType"
//             value={bookingData.clothType}
//             onChange={handleChange}
//             className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
//           >
//             <option value="cotton">Cotton</option>
//             <option value="silk">Silk</option>
//             <option value="linen">Linen</option>
//           </motion.select>

//           <label className="font-semibold text-red-600">
//             Stitching Complexity
//           </label>
//           <motion.select
//             whileFocus={{ scale: 1.03 }}
//             name="complexity"
//             value={bookingData.complexity}
//             onChange={handleChange}
//             className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
//           >
//             <option value="simple">Simple</option>
//             <option value="moderate">Moderate</option>
//             <option value="complex">Complex</option>
//           </motion.select>

//           <label className="flex items-center gap-2 text-red-600">
//             <input
//               type="checkbox"
//               name="rush"
//               checked={bookingData.rush}
//               onChange={handleChange}
//             />
//             Rush Order (holiday)
//           </label>

//           <motion.div className="font-bold text-lg text-red-600">
//             Total Price: ${totalPrice}
//           </motion.div>

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="bg-gradient-to-r from-red-600 via-black to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
//             type="submit"
//           >
//             Submit Booking
//           </motion.button>
//         </motion.form>

//         {totalPrice > 0 && <Payment amount={totalPrice} />}
//       </div>
//     </section>
//   );
// }

import { insertRow } from "../lib/offline";
import React, { useState, useEffect } from "react";
import Payment from "../Components/Payment";
import { motion } from "framer-motion";
// import api from "../utils/axios";
import AOS from "aos";
import "aos/dist/aos.css";
import toast from "react-hot-toast";

export default function Booking() {
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    clothType: "cotton",
    complexity: "simple",
    rush: false,
  });

  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    let base = 0;
    if (bookingData.clothType === "cotton") base = 20;
    if (bookingData.clothType === "silk") base = 40;
    if (bookingData.clothType === "linen") base = 30;

    if (bookingData.complexity === "simple") base += 10;
    if (bookingData.complexity === "moderate") base += 25;
    if (bookingData.complexity === "complex") base += 45;

    if (bookingData.rush) base += 30;

    setTotalPrice(base);
  }, [bookingData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(bookingData).forEach(key => {
      if (key !== "rush" && !bookingData[key].trim()) {
        newErrors[key] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const r = await insertRow("bookings", { ...bookingData, totalPrice });
      toast.success(
        r.queued
          ? "Offline: booking saved, internet aate hi sync hogi"
          : "Booking saved successfully!"
      );
      setBookingData({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        clothType: "cotton",
        complexity: "simple",
        rush: false,
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error making booking");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-16 px-6 bg-black">
      <div className="w-full max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center mb-10 text-red-600"
        >
          Book Tailor Service
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          data-aos="fade-up"
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 flex flex-col gap-5 shadow-lg border border-red-600"
        >
          {[
            { name: "name", placeholder: "Full Name" },
            { name: "email", placeholder: "Email" },
            { name: "phone", placeholder: "Phone" },
            { name: "service", placeholder: "Service Required" },
            { name: "date", placeholder: "Date", type: "date" },
          ].map(field => (
            <motion.div
              key={field.name}
              animate={
                errors[field.name] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={bookingData[field.name]}
                onChange={handleChange}
                className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              {errors[field.name] && (
                <span className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </span>
              )}
            </motion.div>
          ))}

          <label className="font-semibold text-red-600">Cloth Type</label>
          <motion.select
            whileFocus={{ scale: 1.03 }}
            name="clothType"
            value={bookingData.clothType}
            onChange={handleChange}
            className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
          >
            <option value="cotton">Cotton</option>
            <option value="silk">Silk</option>
            <option value="linen">Linen</option>
          </motion.select>

          <label className="font-semibold text-red-600">
            Stitching Complexity
          </label>
          <motion.select
            whileFocus={{ scale: 1.03 }}
            name="complexity"
            value={bookingData.complexity}
            onChange={handleChange}
            className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
          >
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </motion.select>

          <label className="flex items-center gap-2 text-red-600">
            <input
              type="checkbox"
              name="rush"
              checked={bookingData.rush}
              onChange={handleChange}
            />
            Rush Order (holiday)
          </label>

          <motion.div className="font-bold text-lg text-red-600">
            Total Price: ${totalPrice}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-red-600 via-black to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
            type="submit"
          >
            Submit Booking
          </motion.button>
        </motion.form>

        {totalPrice > 0 && <Payment amount={totalPrice} />}
      </div>
    </section>
  );
}
