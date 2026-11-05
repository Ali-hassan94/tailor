// import { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FiMenu,
//   FiX,
//   FiHome,
//   FiEdit,
//   FiUser,
//   FiGrid,
//   FiSettings,
//   FiPlusSquare,
//   FiLogIn,
//   FiUserPlus,
// } from "react-icons/fi";

// export default function Navbar() {
//   const [open, setOpen] = useState(false);
//   const location = useLocation();

//   const desktopLinks = [
//     { name: "Home", path: "/", icon: <FiHome /> },
//     { name: "Order", path: "/order", icon: <FiEdit /> },
//     { name: "Measurements", path: "/measurements", icon: <FiGrid /> },
//     {
//       name: "PhysicalMeasurements",
//       path: "/PhysicalMeasurements",
//       icon: <FiGrid />,
//     },
//     { name: "Portfolio", path: "/portfolio", icon: <FiGrid /> },
//     { name: "Profile", path: "/profile", icon: <FiUser /> },
//     { name: "Dashboard", path: "/dashboard", icon: <FiSettings /> },
//     { name: "Design", path: "/AdminAddDesign", icon: <FiPlusSquare /> },
//   ];

//   const mobileLinks = [
//     ...desktopLinks,
//     { name: "Login", path: "/login", icon: <FiLogIn /> },
//     { name: "Register", path: "/register", icon: <FiUserPlus /> },
//   ];

//   return (
//     <nav className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-red-700 via-black to-red-700 text-white shadow-lg">
//       {/* Nav Bar - Fixed Height so no shaking */}
//       <div className="max-w-7xl mx-auto px-4 py-4 h-20 flex justify-between items-center">
//         <Link
//           to="/"
//           className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-white"
//         >
//           <img src="" alt="" /> // add logo here
//         </Link>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center gap-4 text-lg">
//           {desktopLinks.map((link, i) => (
//             <motion.div
//               key={i}
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Link
//                 to={link.path}
//                 className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
//                   location.pathname === link.path
//                     ? "bg-red-600 text-white shadow-md"
//                     : "hover:bg-red-500 hover:text-white"
//                 }`}
//               >
//                 {link.icon}
//                 {link.name}
//               </Link>
//             </motion.div>
//           ))}
//         </div>

//         {/* Mobile Menu Button */}
//         <button
//           onClick={() => setOpen(!open)}
//           className="md:hidden text-3xl focus:outline-none"
//         >
//           {open ? <FiX /> : <FiMenu />}
//         </button>
//       </div>

//       {/* Mobile Dropdown Overlay - No shifting */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -30 }}
//             transition={{ duration: 0.25 }}
//             className="md:hidden absolute top-20 left-0 w-full bg-black bg-opacity-95 text-white py-6 flex flex-col gap-3 shadow-2xl px-4"
//           >
//             {mobileLinks.map((link, i) => (
//               <Link
//                 key={i}
//                 to={link.path}
//                 onClick={() => setOpen(false)}
//                 className={`flex items-center gap-3 px-3 py-2 rounded-lg text-lg transition-colors duration-200 ${
//                   location.pathname === link.path
//                     ? "bg-red-600 text-white"
//                     : "hover:bg-red-500 hover:text-white"
//                 }`}
//               >
//                 <span className="text-2xl">{link.icon}</span>
//                 {link.name}
//               </Link>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// }
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiHome,
  FiEdit,
  FiUser,
  FiGrid,
  FiSettings,
  FiPlusSquare,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
} from "react-icons/fi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loggedIn = !!user;
  const isTailor = ["tailor", "admin"].includes(user?.role);

  const doLogout = async () => {
    await logoutUser();
    setOpen(false);
    navigate("/login");
  };

  const desktopLinks = [
    { name: "Home", path: "/", icon: <FiHome /> },
    { name: "Order", path: "/order", icon: <FiEdit /> },
    {
      name: "Measurements",
      path: "/PhysicalMeasurements",
      icon: <FiGrid />,
    },
    { name: "Portfolio", path: "/portfolio", icon: <FiGrid /> },
    { name: "Profile", path: "/profile", icon: <FiUser /> },
    {
      name: isTailor ? "Dashboard" : "My Orders",
      path: "/dashboard",
      icon: <FiSettings />,
    },
    ...(isTailor
      ? [
          { name: "Manage Designs", path: "/manage-designs", icon: <FiPlusSquare /> },
          { name: "Staff", path: "/manage-staff", icon: <FiUser /> },
        ]
      : []),
  ];

  const mobileLinks = [
    ...desktopLinks,
    ...(loggedIn
      ? []
      : [
          { name: "Login", path: "/login", icon: <FiLogIn /> },
          { name: "Register", path: "/register", icon: <FiUserPlus /> },
        ]),
  ];

  return (
    <nav className="w-full fixed top-0 left-0 lg:pr-25 z-50 bg-gradient-to-r from-red-700 via-black to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 h-20 flex justify-between items-center">
        {/* LOGO + URDU TEXT */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <img
              src="/logo2.png"
              alt="Shaan Tailor Logo"
              className="h-20 w-auto object-contain scale-125"
            />
          </Link>

          {/* Urdu Title */}
          <h1 className="font-bold text-2xl lg:text-3xl pr-2 whitespace-nowrap">
            شان ٹیلر ماسٹر
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 text-lg">
          {desktopLinks.map((link, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={link.path}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-red-600 text-white shadow-md"
                    : "hover:bg-red-500 hover:text-white"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            </motion.div>
          ))}
          {loggedIn ? (
            <button
              onClick={doLogout}
              className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-500"
            >
              <FiLogOut /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-500">
                <FiLogIn /> Login
              </Link>
              <Link to="/register" className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-500">
                <FiUserPlus /> Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl focus:outline-none"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-20 left-0 w-full bg-black bg-opacity-95 text-white py-6 flex flex-col gap-3 shadow-2xl px-4"
          >
            {mobileLinks.map((link, i) => (
              <Link
                key={i}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-lg transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "bg-red-600 text-white"
                    : "hover:bg-red-500 hover:text-white"
                }`}
              >
                <span className="text-2xl">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            {loggedIn && (
              <button
                onClick={doLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-lg text-left hover:bg-red-500"
              >
                <span className="text-2xl"><FiLogOut /></span>
                Logout ({user?.name || "user"})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
