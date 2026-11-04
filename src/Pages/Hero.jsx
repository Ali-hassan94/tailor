// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// function useTypewriter(words, speed = 120, pause = 1000) {
//   const [index, setIndex] = useState(0);
//   const [text, setText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const current = words[index];
//     let timer;

//     if (!isDeleting) {
//       timer = setTimeout(() => {
//         setText(current.slice(0, text.length + 1));
//       }, speed);

//       if (text === current) {
//         timer = setTimeout(() => setIsDeleting(true), pause);
//       }
//     } else {
//       timer = setTimeout(() => {
//         setText(current.slice(0, text.length - 1));
//       }, speed);

//       if (text === "") {
//         setIsDeleting(false);
//         setIndex(prev => (prev + 1) % words.length);
//       }
//     }

//     return () => clearTimeout(timer);
//   }, [text, isDeleting, index, words, speed, pause]);

//   return text;
// }

// function Home() {
//   const typeText = useTypewriter([
//     "Professional Stitching and Design Specialist",
//     "Expert in Modern Cutting",
//     "Perfect Fitting Service",
//     "Clean Finishing Work",
//   ]);

//   return (
//     <>
//       {/* HERO SECTION */}
//       <div className="min-h-screen w-full bg-[#0a0a0a] text-white px-4 sm:px-6 lg:px-20 flex items-center overflow-x-hidden">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full">
//           {/* LEFT TEXT */}
//           <motion.div
//             initial={{ opacity: 0, x: -40 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1 }}
//             className="text-center lg:text-left"
//           >
//             <p className="text-red-500 text-lg mb-2">Hello, I am</p>

//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
//               Ali Shan
//             </h1>

//             {/* TYPEWRITER */}
//             <h2 className="text-xl sm:text-2xl text-red-500 font-semibold mb-6 h-8">
//               {typeText}
//               <span className="inline-block w-1 bg-red-500 ml-1 animate-pulse"></span>
//             </h2>

//             <p className="text-gray-300 leading-relaxed mb-8 max-w-full sm:max-w-lg mx-auto lg:mx-0">
//               I create high quality stitched clothes with perfect fitting,
//               modern cutting style, and clean finishing. You can order online,
//               save measurements, and get custom clothes delivered on time.
//             </p>

//             {/* BUTTONS */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//               <Link to="/Booking">
//                 <motion.button
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.92 }}
//                   className="bg-red-600 px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
//                 >
//                   Book Now
//                 </motion.button>
//               </Link>

//               <motion.button
//                 whileHover={{ scale: 1.08 }}
//                 whileTap={{ scale: 0.92 }}
//                 className="border border-red-600 px-8 py-3 rounded-lg font-medium w-full sm:w-auto"
//               >
//                 Contact
//               </motion.button>

//               {/* NEW BUTTONS */}
//               <Link to="/Login">
//                 <motion.button
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.92 }}
//                   className="bg-white text-black px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
//                 >
//                   Login
//                 </motion.button>
//               </Link>

//               <Link to="/Register">
//                 <motion.button
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.92 }}
//                   className="bg-red-700 px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
//                 >
//                   Sign Up
//                 </motion.button>
//               </Link>
//             </div>
//           </motion.div>

//           {/* RIGHT IMAGE */}
//           <motion.div
//             initial={{ opacity: 0, x: 40 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1 }}
//             className="flex justify-center lg:justify-end"
//           >
//             <div className="relative w-56 sm:w-64 md:w-72 lg:w-80 h-56 sm:h-64 md:h-72 lg:h-80 rounded-full bg-red-600 overflow-hidden">
//               <div className="absolute inset-0 rounded-full ring-4 border-red-500 ring-red-600 shadow-[0_0_40px_10px_rgba(255,0,0,0.5)]"></div>

//               <img
//                 src="/shan.png"
//                 className="w-full h-full object-cover border-red-500 rounded-full"
//               />
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* ABOUT SECTION */}
//       <div className="w-full bg-[#0a0a0a] text-white px-4 sm:px-6 lg:px-20 py-16 sm:py-20 overflow-x-hidden">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//           viewport={{ once: true }}
//           className="max-w-4xl mx-auto text-center"
//         >
//           <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-red-500">
//             About Me
//           </h2>

//           <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
//             I have worked in stitching for many years. I focus on clean work,
//             neat cuts, and a good fit. I handle both simple and detailed
//             designs. My goal is to give you clothes that feel comfortable and
//             look sharp. Every order is stitched with care, measured by hand, and
//             checked before delivery.
//           </p>

//           <p className="text-gray-300 leading-relaxed text-base sm:text-lg mt-6">
//             I also provide online service. You can share your measurements,
//             place your order, and get your stitched clothes delivered to your
//             home. Quality, fit, and time are my main priorities.
//           </p>

//           <div className="mt-10 flex justify-center">
//             <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_25px_rgba(255,0,0,0.4)]">
//               <img src="/shan.png" className="w-full h-full object-cover" />
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// }

// export default Home;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function useTypewriter(words, speed = 120, pause = 1000) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[index];
    let timer;

    if (!isDeleting) {
      timer = setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, speed);

      if (text === current) {
        timer = setTimeout(() => setIsDeleting(true), pause);
      }
    } else {
      timer = setTimeout(() => {
        setText(current.slice(0, text.length - 1));
      }, speed);

      if (text === "") {
        setIsDeleting(false);
        setIndex(prev => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, words, speed, pause]);

  return text;
}

function Home() {
  const typeText = useTypewriter([
    "Professional Stitching and Design Specialist",
    "Expert in Modern Cutting",
    "Perfect Fitting Service",
    "Clean Finishing Work",
  ]);

  return (
    <>
      {/* HERO SECTION */}
      <div className="min-h-screen w-full bg-[#0a0a0a] text-white px-4 sm:px-6 lg:px-20 flex items-center overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-22 gap-10 items-center w-full">
          {/* LEFT TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-center lg:text-left"
          >
            <p className="text-red-500 text-lg mb-2">Hello, I am</p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Ali Shan
            </h1>

            {/* TYPEWRITER */}
            <h2 className="text-xl sm:text-2xl text-red-500 font-semibold mb-6 h-8">
              {typeText}
              <span className="inline-block w-1 bg-red-500 ml-1 animate-pulse"></span>
            </h2>

            <p className="text-gray-300 leading-relaxed mb-8 max-w-full sm:max-w-lg mx-auto lg:mx-0">
              I create high quality stitched clothes with perfect fitting,
              modern cutting style, and clean finishing. You can order online,
              save measurements, and get custom clothes delivered on time.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/Booking">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-red-600 px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
                >
                  Book Now
                </motion.button>
              </Link>

              <Link to="/Contact">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="border border-red-600 px-8 py-3 rounded-lg font-medium w-full sm:w-auto"
                >
                  Contact
                </motion.button>
              </Link>

              {/* NEW BUTTONS */}
              <Link to="/Login">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
                >
                  Login
                </motion.button>
              </Link>

              <Link to="/Register">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-red-700 px-8 py-3 rounded-lg font-medium shadow-lg w-full sm:w-auto"
                >
                  Sign Up
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-56 sm:w-64 md:w-72 lg:w-80 h-56 sm:h-64 md:h-72 lg:h-80 rounded-full bg-red-600 overflow-hidden">
              <div className="absolute inset-0 rounded-full ring-4 border-red-500 ring-red-600 shadow-[0_0_40px_10px_rgba(255,0,0,0.5)]"></div>

              <img
                src="/shan.png"
                className="w-full h-full object-cover border-red-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className="w-full bg-[#0a0a0a] text-white px-4 sm:px-6 lg:px-20 py-16 sm:py-20 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-red-500">
            About Me
          </h2>

          <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
            I have worked in stitching for many years. I focus on clean work,
            neat cuts, and a good fit. I handle both simple and detailed
            designs. My goal is to give you clothes that feel comfortable and
            look sharp. Every order is stitched with care, measured by hand, and
            checked before delivery.
          </p>

          <p className="text-gray-300 leading-relaxed text-base sm:text-lg mt-6">
            I also provide online service. You can share your measurements,
            place your order, and get your stitched clothes delivered to your
            home. Quality, fit, and time are my main priorities.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_25px_rgba(255,0,0,0.4)]">
              <img src="/shan.png" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Home;
