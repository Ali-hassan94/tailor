import React, { useState } from "react";
import { insertRow } from "../lib/offline";
import toast, { Toaster } from "react-hot-toast";

import { motion } from "framer-motion";

export default function Measurements() {
  const [measurements, setMeasurements] = useState({
    name: "",
    phone: "",
    chest: "",
    waist: "",
    hips: "",
    shoulders: "",
    length: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
    if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    let newErrors = {};
    Object.keys(measurements).forEach(key => {
      if (!measurements[key].trim()) newErrors[key] = "This field is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!localStorage.getItem("user"))
        return toast.error("You must be logged in");

      const r = await insertRow("measurements", measurements);
      toast.success(
        r.queued ? "Offline: saved, internet aate hi sync hoga" : "Measurements saved"
      );
      setMeasurements({
        name: "",
        phone: "",
        chest: "",
        waist: "",
        hips: "",
        shoulders: "",
        length: "",
      });
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Save failed");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-16 px-6 bg-gradient-to-br from-red-600 via-gray-900 to-white">
      <div className="w-full max-w-2xl mt-11">
        <h2 className="lg:text-4xl text-3xl font-bold text-center mb-8 text-red-100">
          Your Measurements
        </h2>
        <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl p-6 flex flex-col gap-6 shadow-lg border border-red-600">
          {Object.keys(measurements).map(key => (
            <motion.div
              key={key}
              animate={errors[key] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              <input
                type="text"
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={measurements[key]}
                onChange={handleChange}
                className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-gray-900 to-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              {errors[key] && (
                <span className="text-red-500 text-sm mt-1">{errors[key]}</span>
              )}
            </motion.div>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="bg-gradient-to-r from-red-600 via-gray-900 to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
          >
            Save Measurements
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// import React, { useState } from "react";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";

// import { motion } from "framer-motion";

// export default function Measurements() {
//   const [measurements, setMeasurements] = useState({
//     name: "",
//     phone: "",
//     chest: "",
//     waist: "",
//     hips: "",
//     shoulders: "",
//     length: "",
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setMeasurements(prev => ({ ...prev, [name]: value }));
//     if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const handleSave = async () => {
//     let newErrors = {};
//     Object.keys(measurements).forEach(key => {
//       if (!measurements[key].trim()) newErrors[key] = "This field is required";
//     });

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return toast.success("You must be logged in");

//       await axios.post("http://localhost:4000/measurement/save", measurements, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       toast.success("Measurements saved");
//       setMeasurements({
//         name: "",
//         phone: "",
//         chest: "",
//         waist: "",
//         hips: "",
//         shoulders: "",
//         length: "",
//       });
//       setErrors({});
//     } catch (err) {
//       toast.error(err.message || "Save failed");
//       console.error(err.response?.data || err.message);
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-center justify-center py-16 px-6 bg-gradient-to-br from-red-600 via-gray-900 to-white">
//       <div className="w-full max-w-2xl mt-11">
//         <h2 className="lg:text-4xl text-3xl font-bold text-center mb-8 text-red-100">
//           Your Measurements
//         </h2>
//         <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl p-6 flex flex-col gap-6 shadow-lg border border-red-600">
//           {Object.keys(measurements).map(key => (
//             <motion.div
//               key={key}
//               animate={errors[key] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
//               transition={{ duration: 0.4 }}
//               className="flex flex-col"
//             >
//               <input
//                 type="text"
//                 name={key}
//                 placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
//                 value={measurements[key]}
//                 onChange={handleChange}
//                 className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-gray-900 to-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
//               />
//               {errors[key] && (
//                 <span className="text-red-500 text-sm mt-1">{errors[key]}</span>
//               )}
//             </motion.div>
//           ))}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleSave}
//             className="bg-gradient-to-r from-red-600 via-gray-900 to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
//           >
//             Save Measurements
//           </motion.button>
//         </div>
//       </div>
//     </section>
//   );
// }
