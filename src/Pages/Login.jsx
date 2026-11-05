// src/pages/Login.jsx

import React, { useState } from "react";
import { loginUser } from "../lib/api";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validation
    let newErrors = {};
    Object.keys(form).forEach(key => {
      if (!form[key].trim()) newErrors[key] = `${key} required`;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const user = await loginUser(form);
      toast.success(`Login successful! Welcome Brother ${user.name}`);
      navigate("/Home");
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-md bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-xl"
      >
        <h2 className="text-4xl font-bold text-red-600 text-center mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            {
              name: "email",
              icon: <FiMail />,
              placeholder: "Email",
              type: "email",
            },
            {
              name: "password",
              icon: <FiLock />,
              placeholder: "Password",
              type: "password",
            },
          ].map(field => (
            <div className="relative" key={field.name}>
              <motion.div
                initial={{ x: 0 }}
                animate={
                  errors[field.name] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }
                }
                transition={{ duration: 0.4 }}
              >
                {React.cloneElement(field.icon, {
                  className: "absolute top-3 left-3 text-red-600",
                  size: 20,
                })}
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-gray-800 to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                {errors[field.name] && (
                  <span className="text-red-500 text-sm">
                    {errors[field.name]}
                  </span>
                )}
              </motion.div>
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-red-600 via-gray-800 to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
          >
            Login
          </motion.button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="block mx-auto mt-3 text-red-400 underline text-sm"
        >
          Forgot password?
        </button>

        <div className="mt-6 text-center text-gray-300">or login with</div>
        <div className="flex justify-center gap-4 mt-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold shadow"
          >
            <FaGoogle /> Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow"
          >
            <FaFacebookF /> Facebook
          </motion.button>
        </div>

        <div className="mt-4 text-center text-gray-300 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-red-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </div>
      </motion.div>
    </section>
  );
}

// import React, { useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FiMail, FiLock } from "react-icons/fi";
// import { FaGoogle, FaFacebookF } from "react-icons/fa";

// export default function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//     if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     // Validation
//     let newErrors = {};
//     Object.keys(form).forEach(key => {
//       if (!form[key].trim()) newErrors[key] = `${key} required`;
//     });
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       const res = await axios.post("http://localhost:4000/user/login", form);
//       console.log("Login Response:", res.data);

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       localStorage.setItem("role", res.data.user.role);

//       toast.success(`Login successful! Welcome Brother ${res.data.user.name}`);
//       navigate("/Home");
//     } catch (err) {
//       toast.error(err.message || "Login failed");
//     }
//   };

//   return (
//     <section
//       className="min-h-screen flex items-center justify-center px-6 py-16"
//       style={{
//         background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//         className="w-full max-w-md bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl shadow-xl"
//       >
//         <h2 className="text-4xl font-bold text-red-600 text-center mb-6">
//           Login
//         </h2>
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           {[
//             {
//               name: "email",
//               icon: <FiMail />,
//               placeholder: "Email",
//               type: "email",
//             },
//             {
//               name: "password",
//               icon: <FiLock />,
//               placeholder: "Password",
//               type: "password",
//             },
//           ].map(field => (
//             <div className="relative" key={field.name}>
//               <motion.div
//                 initial={{ x: 0 }}
//                 animate={
//                   errors[field.name] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }
//                 }
//                 transition={{ duration: 0.4 }}
//               >
//                 {React.cloneElement(field.icon, {
//                   className: "absolute top-3 left-3 text-red-600",
//                   size: 20,
//                 })}
//                 <input
//                   type={field.type}
//                   name={field.name}
//                   placeholder={field.placeholder}
//                   value={form[field.name]}
//                   onChange={handleChange}
//                   className="w-full pl-10 p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-gray-800 to-white text-black focus:outline-none focus:ring-2 focus:ring-red-600"
//                 />
//                 {errors[field.name] && (
//                   <span className="text-red-500 text-sm">
//                     {errors[field.name]}
//                   </span>
//                 )}
//               </motion.div>
//             </div>
//           ))}

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             className="bg-gradient-to-r from-red-600 via-gray-800 to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
//           >
//             Login
//           </motion.button>
//         </form>

//         <div className="mt-6 text-center text-gray-300">or login with</div>
//         <div className="flex justify-center gap-4 mt-3">
//           <motion.button
//             whileHover={{ scale: 1.1 }}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold shadow"
//           >
//             <FaGoogle /> Google
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.1 }}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow"
//           >
//             <FaFacebookF /> Facebook
//           </motion.button>
//         </div>

//         <div className="mt-4 text-center text-gray-300 text-sm">
//           Don't have an account?{" "}
//           <span
//             onClick={() => navigate("/register")}
//             className="text-red-600 cursor-pointer hover:underline"
//           >
//             Register
//           </span>
//         </div>
//       </motion.div>
//     </section>
//   );
// }
