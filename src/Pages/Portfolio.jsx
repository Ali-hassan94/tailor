// import React, { useEffect, useState } from "react";
// import ServiceCard from "../Components/ServiceCard";
// import { useNavigate } from "react-router-dom";

// export default function Portfolio() {
//   const [designs, setDesigns] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDesigns = async () => {
//       try {
//         const res = await fetch("http://localhost:4000/api/designs");
//         const data = await res.json();
//         setDesigns(data);
//       } catch (err) {
//         console.error("Failed to load designs", err);
//       }
//     };
//     fetchDesigns();
//   }, []);

//   const bookSimilar = design =>
//     navigate("/order", { state: { designTitle: design.title } });

//   return (
//     <section className="py-16 px-6 bg-slate-50">
//       <div className="max-w-6xl mx-auto text-center mb-10">
//         <h2 className="text-3xl font-bold">Our Portfolio</h2>
//         <p className="mt-2 text-gray-500">
//           Check our recent stitching projects
//         </p>
//       </div>

//       <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
//         {designs.map((design, i) => (
//           <div key={i}>
//             <ServiceCard
//               img={`http://localhost:4000/${design.img}`}
//               title={design.title}
//             />

//             <button
//               onClick={() => bookSimilar(design)}
//               className="mt-2 w-full bg-sky-600 text-white rounded px-3 py-2 hover:bg-sky-700"
//             >
//               Book Similar
//             </button>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import { listDesigns } from "../lib/api";
import React, { useEffect, useState } from "react";
import ServiceCard from "../Components/ServiceCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import toast, { Toaster } from "react-hot-toast";

export default function Portfolio() {
  const [designs, setDesigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setDesigns(await listDesigns());
      } catch (err) {
        toast.error("Failed to load designs", err);
      }
    };
    fetchDesigns();
  }, []);

  const bookSimilar = design =>
    navigate("/order", { state: { designTitle: design.title } });

  return (
    <section
      className="py-16 px-6 min-h-screen"
      style={{
        background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center mb-12 mt-11 text-white"
      >
        <h2 className="text-4xl font-bold text-red-200">Our Portfolio</h2>
        <p className="mt-2 text-gray-200">
          Check our recent stitching projects
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {designs.map((design, i) => (
          <motion.div
            key={i}
            data-aos="fade-up"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center shadow-lg border border-red-600"
          >
            <ServiceCard
              img={design.img}
              title={design.title}
            />

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#b91c1c" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => bookSimilar(design)}
              className="mt-4 w-full bg-gradient-to-r from-red-600 via-black to-white text-white rounded px-3 py-2 font-semibold shadow-md"
            >
              Book Similar
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
