import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation } from "react-router-dom";
import { insertRow } from "../lib/offline";
import { compressImage } from "../lib/image";
import { calculatePrice } from "../utils/priceCalculator";
import Payment from "../Components/Payment.jsx";

export default function Order() {
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    design: "",
    measurements: "",
    clothType: "cotton",
    complexity: "simple",
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [photos, setPhotos] = useState([]);

  const pickPhotos = e => {
    const files = [...(e.target.files || [])];
    const room = Math.max(0, 3 - photos.length);
    if (files.length > room) toast.error("Maximum 3 photos");
    const add = files.slice(0, room).map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...add]);
    e.target.value = "";
  };
  const removePhoto = i => setPhotos(p => p.filter((_, k) => k !== i));

  useEffect(() => {
    AOS.init({ duration: 900 });
  }, []);

  useEffect(() => {
    if (location.state?.designTitle) {
      setFormData(prev => ({ ...prev, design: location.state.designTitle }));
    }
  }, [location.state]);

  useEffect(() => {
    setTotalPrice(calculatePrice(formData.clothType, formData.complexity));
  }, [formData.clothType, formData.complexity]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (!formData[field]?.trim()) newErrors[field] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const blobs = await Promise.all(photos.map(p => compressImage(p.file, 1280, 0.75)));
      const r = await insertRow("orders", { ...formData, totalPrice }, { photos: blobs });
      setPhotos([]);
      toast.success(
        r.queued
          ? "Offline: order saved, internet aate hi sync ho jayega"
          : "Order Successfully created!"
      );
    } catch (err) {
      toast.error(err.message || "Order failed");

      // alert(err.message || "Order failed");
    }

    setLoading(false);
  };

  const gradientInput =
    "p-3 roundedlg outline-none w-full bg-gradient-to-r from-black via-red-700 to-black text-white placeholder-gray-300 border border-red-600 focus:ring2 focus:ring-red-500 focus:border-red-500 transition-all";

  return (
    <section className="min-h-screen bg-black text-white px-5 py-16 flex justify-center">
      <div className="w-full max-w3xl mt-15">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-4xl md:text-5xl font-bold text-red-600 mb-10"
        >
          Place Your Stitching Order
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          data-aos="fade-up"
          className="bg-white bg-opacity10 roundedxl border border-red-600 border-opacity40 shadowxl p-7 md:p-10 flex flex-col gap-4"
        >
          {/* Text Inputs */}
          {[
            { name: "name", placeholder: "Full Name" },
            { name: "email", placeholder: "Email" },
            { name: "phone", placeholder: "Phone Number" },
            { name: "design", placeholder: "Design or Style" },
          ].map(input => (
            <div key={input.name}>
              <motion.input
                whileFocus={{ scale: 1.03 }}
                type="text"
                name={input.name}
                placeholder={input.placeholder}
                value={formData[input.name]}
                onChange={handleChange}
                className={gradientInput}
              />
              {errors[input.name] && (
                <p className="text-red-400 text-sm mt-1">
                  {errors[input.name]}
                </p>
              )}
            </div>
          ))}

          {/* Measurements */}
          <div>
            <motion.textarea
              whileFocus={{ scale: 1.03 }}
              name="measurements"
              placeholder="Enter your measurements"
              rows={4}
              value={formData.measurements}
              onChange={handleChange}
              className={gradientInput}
            />
            {errors.measurements && (
              <p className="text-red-400 text-sm mt-1">{errors.measurements}</p>
            )}
          </div>

          {/* Selects */}
          <label className="font-semibold text-red-600">Cloth Type</label>
          <motion.select
            whileFocus={{ scale: 1.03 }}
            name="clothType"
            value={formData.clothType}
            onChange={handleChange}
            className={gradientInput}
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
            value={formData.complexity}
            onChange={handleChange}
            className={gradientInput}
          >
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </motion.select>

          <div>
            <label className="font-semibold text-red-600">
              Cloth / design photos (optional, max 3)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={pickPhotos}
              className="block w-full mt-2 text-sm"
            />
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p.url}
                      alt="selected"
                      className="w-20 h-20 object-cover rounded-lg border border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold textlg text-red-600 mt-2"
          >
            Total Price: Rs {totalPrice}
          </motion.div>

          {/* Submit button with loader */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.9 }}
            className="bg-red-600 text-white px-6 py-3 roundedlg font-semibold shadow-md flex justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Submit Order"
            )}
          </motion.button>
        </motion.form>

        {totalPrice > 0 && <Payment amount={totalPrice} />}
      </div>
    </section>
  );
}

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { calculatePrice } from "../utils/priceCalculator";
// import Payment from "../components/Payment";

// export default function Order() {
//   const location = useLocation();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     design: "",
//     measurements: "",
//     clothType: "cotton",
//     complexity: "simple",
//   });

//   const [totalPrice, setTotalPrice] = useState(0);

//   useEffect(() => {
//     AOS.init({ duration: 1000 });
//   }, []);

//   // Prefill design if coming from Portfolio
//   useEffect(() => {
//     if (location.state?.designTitle) {
//       setFormData(prev => ({ ...prev, design: location.state.designTitle }));
//     }
//   }, [location.state]);

//   // Update total price when clothType or complexity changes
//   useEffect(() => {
//     setTotalPrice(calculatePrice(formData.clothType, formData.complexity));
//   }, [formData.clothType, formData.complexity]);

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         "http://localhost:4000/orders/place",
//         { ...formData, totalPrice },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert("Order placed successfully");
//       console.log(res.data);
//     } catch (err) {
//       alert(err.message || "Order failed");
//     }
//   };

//   return (
//     <section className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-16 py-16">
//       <motion.h2
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//         className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 text-red-600"
//       >
//         Place Your Stitching Order
//       </motion.h2>

//       <motion.form
//         onSubmit={handleSubmit}
//         data-aos="fade-up"
//         className="bg-white text-black shadow-lg rounded-xl p-6 sm:p-8 md:p-10 flex flex-col gap-4 md:max-w-3xl mx-auto"
//       >
//         <motion.input
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           type="text"
//           name="phone"
//           placeholder="Phone Number"
//           value={formData.phone}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         />
//         <motion.input
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           type="text"
//           name="design"
//           placeholder="Design / Style"
//           value={formData.design}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         />
//         <motion.textarea
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           name="measurements"
//           placeholder="Enter your measurements"
//           value={formData.measurements}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//           rows={4}
//         />

//         <label className="font-medium">Cloth Type:</label>
//         <motion.select
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           name="clothType"
//           value={formData.clothType}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         >
//           <option value="cotton">Cotton</option>
//           <option value="silk">Silk</option>
//           <option value="linen">Linen</option>
//         </motion.select>

//         <label className="font-medium">Stitching Complexity:</label>
//         <motion.select
//           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
//           name="complexity"
//           value={formData.complexity}
//           onChange={handleChange}
//           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
//         >
//           <option value="simple">Simple</option>
//           <option value="moderate">Moderate</option>
//           <option value="complex">Complex</option>
//         </motion.select>

//         <motion.div
//           className="mt-4 font-bold text-lg text-red-600"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//         >
//           Total Price: ${totalPrice}
//         </motion.div>

//         <motion.button
//           whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,0,0.5)" }}
//           whileTap={{ scale: 0.95 }}
//           type="submit"
//           className="bg-red-600 text-white rounded-lg px-6 py-3 mt-3 font-semibold shadow-md"
//         >
//           Submit Order
//         </motion.button>
//       </motion.form>

//       {totalPrice > 0 && <Payment amount={totalPrice} />}
//     </section>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import toast, { Toaster } from "react-hot-toast";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { calculatePrice } from "../utils/priceCalculator";
// import Payment from "../Components/Payment.jsx";

// export default function Order() {
//   const location = useLocation();

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     design: "",
//     measurements: "",
//     clothType: "cotton",
//     complexity: "simple",
//   });

//   const [totalPrice, setTotalPrice] = useState(0);

//   useEffect(() => {
//     AOS.init({ duration: 900 });
//   }, []);

//   useEffect(() => {
//     if (location.state?.designTitle) {
//       setFormData(prev => ({ ...prev, design: location.state.designTitle }));
//     }
//   }, [location.state]);

//   useEffect(() => {
//     setTotalPrice(calculatePrice(formData.clothType, formData.complexity));
//   }, [formData.clothType, formData.complexity]);

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     Object.keys(formData).forEach(field => {
//       if (!formData[field]?.trim()) newErrors[field] = "Required";
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     if (!validate()) return;

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");

//       await axios.post(
//         "http://localhost:4000/orders/place",
//         { ...formData, totalPrice },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Order Successfully created!");
//     } catch (err) {
//       toast.error(err.message || "Order failed");

//       // alert(err.message || "Order failed");
//     }

//     setLoading(false);
//   };

//   const gradientInput =
//     "p-3 roundedlg outline-none w-full bg-gradient-to-r from-black via-red-700 to-black text-white placeholder-gray-300 border border-red-600 focus:ring2 focus:ring-red-500 focus:border-red-500 transition-all";

//   return (
//     <section className="min-h-screen bg-black text-white px-5 py-16 flex justify-center">
//       <div className="w-full max-w3xl mt-15">
//         <motion.h2
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-center text-4xl md:text-5xl font-bold text-red-600 mb-10"
//         >
//           Place Your Stitching Order
//         </motion.h2>

//         <motion.form
//           onSubmit={handleSubmit}
//           data-aos="fade-up"
//           className="bg-white bg-opacity10 roundedxl border border-red-600 border-opacity40 shadowxl p-7 md:p-10 flex flex-col gap-4"
//         >
//           {/* Text Inputs */}
//           {[
//             { name: "name", placeholder: "Full Name" },
//             { name: "email", placeholder: "Email" },
//             { name: "phone", placeholder: "Phone Number" },
//             { name: "design", placeholder: "Design or Style" },
//           ].map(input => (
//             <div key={input.name}>
//               <motion.input
//                 whileFocus={{ scale: 1.03 }}
//                 type="text"
//                 name={input.name}
//                 placeholder={input.placeholder}
//                 value={formData[input.name]}
//                 onChange={handleChange}
//                 className={gradientInput}
//               />
//               {errors[input.name] && (
//                 <p className="text-red-400 text-sm mt-1">
//                   {errors[input.name]}
//                 </p>
//               )}
//             </div>
//           ))}

//           {/* Measurements */}
//           <div>
//             <motion.textarea
//               whileFocus={{ scale: 1.03 }}
//               name="measurements"
//               placeholder="Enter your measurements"
//               rows={4}
//               value={formData.measurements}
//               onChange={handleChange}
//               className={gradientInput}
//             />
//             {errors.measurements && (
//               <p className="text-red-400 text-sm mt-1">{errors.measurements}</p>
//             )}
//           </div>

//           {/* Selects */}
//           <label className="font-semibold text-red-600">Cloth Type</label>
//           <motion.select
//             whileFocus={{ scale: 1.03 }}
//             name="clothType"
//             value={formData.clothType}
//             onChange={handleChange}
//             className={gradientInput}
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
//             value={formData.complexity}
//             onChange={handleChange}
//             className={gradientInput}
//           >
//             <option value="simple">Simple</option>
//             <option value="moderate">Moderate</option>
//             <option value="complex">Complex</option>
//           </motion.select>

//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="font-bold textlg text-red-600 mt-2"
//           >
//             Total Price: ${totalPrice}
//           </motion.div>

//           {/* Submit button with loader */}
//           <motion.button
//             whileHover={{ scale: loading ? 1 : 1.05 }}
//             whileTap={{ scale: loading ? 1 : 0.9 }}
//             className="bg-red-600 text-white px-6 py-3 roundedlg font-semibold shadow-md flex justify-center"
//             type="submit"
//             disabled={loading}
//           >
//             {loading ? (
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 0.8 }}
//                 className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
//               />
//             ) : (
//               "Submit Order"
//             )}
//           </motion.button>
//         </motion.form>

//         {totalPrice > 0 && <Payment amount={totalPrice} />}
//       </div>
//     </section>
//   );
// }

// // import React, { useState, useEffect } from "react";
// // import { motion } from "framer-motion";
// // import AOS from "aos";
// // import "aos/dist/aos.css";
// // import { useLocation } from "react-router-dom";
// // import axios from "axios";
// // import { calculatePrice } from "../utils/priceCalculator";
// // import Payment from "../components/Payment";

// // export default function Order() {
// //   const location = useLocation();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     phone: "",
// //     design: "",
// //     measurements: "",
// //     clothType: "cotton",
// //     complexity: "simple",
// //   });

// //   const [totalPrice, setTotalPrice] = useState(0);

// //   useEffect(() => {
// //     AOS.init({ duration: 1000 });
// //   }, []);

// //   // Prefill design if coming from Portfolio
// //   useEffect(() => {
// //     if (location.state?.designTitle) {
// //       setFormData(prev => ({ ...prev, design: location.state.designTitle }));
// //     }
// //   }, [location.state]);

// //   // Update total price when clothType or complexity changes
// //   useEffect(() => {
// //     setTotalPrice(calculatePrice(formData.clothType, formData.complexity));
// //   }, [formData.clothType, formData.complexity]);

// //   const handleChange = e => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async e => {
// //     e.preventDefault();
// //     try {
// //       const token = localStorage.getItem("token");

// //       const res = await axios.post(
// //         "http://localhost:4000/orders/place",
// //         { ...formData, totalPrice },
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       alert("Order placed successfully");
// //       console.log(res.data);
// //     } catch (err) {
// //       alert(err.message || "Order failed");
// //     }
// //   };

// //   return (
// //     <section className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-16 py-16">
// //       <motion.h2
// //         initial={{ opacity: 0, y: -30 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 1 }}
// //         className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 text-red-600"
// //       >
// //         Place Your Stitching Order
// //       </motion.h2>

// //       <motion.form
// //         onSubmit={handleSubmit}
// //         data-aos="fade-up"
// //         className="bg-white text-black shadow-lg rounded-xl p-6 sm:p-8 md:p-10 flex flex-col gap-4 md:max-w-3xl mx-auto"
// //       >
// //         <motion.input
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           type="text"
// //           name="name"
// //           placeholder="Full Name"
// //           value={formData.name}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         />
// //         <motion.input
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           value={formData.email}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         />
// //         <motion.input
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           type="text"
// //           name="phone"
// //           placeholder="Phone Number"
// //           value={formData.phone}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         />
// //         <motion.input
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           type="text"
// //           name="design"
// //           placeholder="Design / Style"
// //           value={formData.design}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         />
// //         <motion.textarea
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           name="measurements"
// //           placeholder="Enter your measurements"
// //           value={formData.measurements}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //           rows={4}
// //         />

// //         <label className="font-medium">Cloth Type:</label>
// //         <motion.select
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           name="clothType"
// //           value={formData.clothType}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         >
// //           <option value="cotton">Cotton</option>
// //           <option value="silk">Silk</option>
// //           <option value="linen">Linen</option>
// //         </motion.select>

// //         <label className="font-medium">Stitching Complexity:</label>
// //         <motion.select
// //           whileFocus={{ scale: 1.02, borderColor: "#ff0000" }}
// //           name="complexity"
// //           value={formData.complexity}
// //           onChange={handleChange}
// //           className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
// //         >
// //           <option value="simple">Simple</option>
// //           <option value="moderate">Moderate</option>
// //           <option value="complex">Complex</option>
// //         </motion.select>

// //         <motion.div
// //           className="mt-4 font-bold text-lg text-red-600"
// //           initial={{ opacity: 0 }}
// //           whileInView={{ opacity: 1 }}
// //           viewport={{ once: true }}
// //         >
// //           Total Price: ${totalPrice}
// //         </motion.div>

// //         <motion.button
// //           whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,0,0.5)" }}
// //           whileTap={{ scale: 0.95 }}
// //           type="submit"
// //           className="bg-red-600 text-white rounded-lg px-6 py-3 mt-3 font-semibold shadow-md"
// //         >
// //           Submit Order
// //         </motion.button>
// //       </motion.form>

// //       {totalPrice > 0 && <Payment amount={totalPrice} />}
// //     </section>
// //   );
// // }
