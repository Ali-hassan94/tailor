// // src/pages/Register.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   const handleChange = e =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:4000/user/register", form);

//       alert("Registration done, please login now");

//       setForm({ name: "", email: "", phone: "", password: "" });

//       navigate("/login"); // redirect to login page
//     } catch (err) {
//       alert(err.response?.data.message || "Registration failed");
//     }
//   };

//   return (
//     <section className="max-w-md mx-auto py-16 px-6">
//       <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4"
//       >
//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={form.name}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <input
//           type="text"
//           name="phone"
//           placeholder="Phone"
//           value={form.phone}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <button
//           type="submit"
//           className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-6 py-3 mt-3"
//         >
//           Register
//         </button>
//       </form>
//     </section>
//   );
// }

// src/pages/Register.jsx
// src/pages/Register.jsx

import React, { useState } from "react";
import { registerUser } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
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
      await registerUser(form);
      toast.success("Registration done, please login now");
      setForm({ name: "", email: "", phone: "", password: "" });
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed");
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
          Register
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { name: "name", icon: <FiUser />, placeholder: "Full Name" },
            { name: "email", icon: <FiMail />, placeholder: "Email" },
            { name: "phone", icon: <FiPhone />, placeholder: "Phone" },
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
                  type={field.type || "text"}
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
            Register
          </motion.button>
        </form>

        <div className="mt-6 text-center text-gray-300">or register with</div>
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
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </div>
      </motion.div>
    </section>
  );
}
