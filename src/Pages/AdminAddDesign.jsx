// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// export default function AdminAddDesign() {
//   const [designs, setDesigns] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:4000/api/designs")
//       .then(res => res.json())
//       .then(data => setDesigns(data));
//   }, []);

//   return (
//     <section
//       className="min-h-screen p-6"
//       style={{
//         background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
//       }}
//     >
//       {/* Main Heading */}
//       <motion.div
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//         className="text-center mb-12"
//       >
//         <h1 className="mt-22 text-5xl font-bold text-amber-300 mb-3">
//           Clothes Designs
//         </h1>
//         <p className="text-white text-lg max-w-xl mx-auto">
//           Explore our latest stitching designs and patterns. Book similar styles
//           instantly and get premium tailoring at your doorstep.
//         </p>
//       </motion.div>

//       {/* Design Grid */}
//       <motion.div
//         className="grid md:grid-cols-4 gap-6 max-w-8xl mx-auto"
//         initial="hidden"
//         animate="visible"
//         variants={{
//           hidden: {},
//           visible: { transition: { staggerChildren: 0.15 } },
//         }}
//       >
//         {designs.map((d, i) => (
//           <motion.div
//             key={i}
//             className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
//             whileHover={{ scale: 1.05, y: -5 }}
//             whileTap={{ scale: 0.95 }}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <img
//               src={d.img}
//               alt={d.title}
//               className="w-full h-70 object-cover rounded-t-lg"
//             />
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="mt-2 font-semibold text-center p-2 bg-gradient-to-r from-red-600 via-black to-white text-white rounded-b-lg"
//             >
//               {d.title}
//             </motion.p>
//           </motion.div>
//         ))}
//       </motion.div>
//     </section>
//   );
// }

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminAddDesign() {
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    fetch("/designs.json")
      .then(res => res.json())
      .then(data => setDesigns(data));
  }, []);

  return (
    <section
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="mt-22 text-5xl font-bold text-amber-300 mb-3">
          Clothes Designs
        </h1>
        <p className="text-white text-lg max-w-xl mx-auto">
          Explore our latest stitching designs and patterns.
        </p>
      </motion.div>

      <motion.div className="grid md:grid-cols-4 gap-6 max-w-8xl mx-auto">
        {designs.map((d, i) => (
          <motion.div
            key={i}
            className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <img
              src={d.img}
              alt={d.title}
              className="w-full h-70 object-cover"
            />
            <p className="mt-2 font-semibold text-center p-2 bg-black text-white">
              {d.title}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
