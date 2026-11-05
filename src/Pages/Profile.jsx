// // src/pages/Profile.jsx
// import React, { useState } from "react";

// export default function Profile() {
//   const [profile, setProfile] = useState({
//     name: "Ali Hassan",
//     email: "ali@example.com",
//     phone: "+92 300 1234567",
//   });

//   const handleChange = e => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     console.log("Profile Updated:", profile);
//     alert("Profile updated successfully!");
//   };

//   return (
//     <section className="max-w-2xl mx-auto py-16 px-6">
//       <h2 className="text-3xl font-bold text-center mb-6">Your Profile</h2>
//       <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4">
//         <input
//           type="text"
//           name="name"
//           value={profile.name}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <input
//           type="email"
//           name="email"
//           value={profile.email}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <input
//           type="text"
//           name="phone"
//           value={profile.phone}
//           onChange={handleChange}
//           className="border p-3 rounded-lg"
//         />
//         <button
//           onClick={handleSave}
//           className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-6 py-3 mt-3"
//         >
//           Save Profile
//         </button>
//       </div>
//     </section>
//   );
// }

// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { logoutUser } from "../lib/api";
import ChangePassword from "../Components/ChangePassword";
import DeleteAccount from "../Components/DeleteAccount";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "Malik Ali Shan",
    email: "alishan@example.com",
    phone: "+92 3143638733",
    photo: "/default-profile.png", // default photo
  });

  const [errors, setErrors] = useState({});

  // Load saved photo from localStorage on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem("profilePhoto");
    if (savedPhoto) {
      setProfile(prev => ({ ...prev, photo: savedPhoto }));
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photo: reader.result }));
        localStorage.setItem("profilePhoto", reader.result); // save to localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let newErrors = {};
    Object.keys(profile).forEach(key => {
      if (key !== "photo" && !profile[key].trim())
        newErrors[key] = "This field is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Profile Updated:", profile);
    toast.success("Profile updated successfully!");
  };

  return (
    <section
      className="min-h-screen py-16 px-6 flex justify-center items-start"
      style={{
        background: "linear-gradient(180deg, #ff0000, #000000, #ffffff)",
      }}
    >
      <div className="w-full max-w-2xl mt-3">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-4xl font-bold text-red-100 mb-10 pt-12"
        >
          Your Profile
        </motion.h2>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              window.location.hash = "#/login";
              window.location.reload();
            }}
            className="px-5 py-2 rounded-lg bg-red-700 text-white font-semibold"
          >
            Logout
          </button>
        </div>

        <ChangePassword />
        <DeleteAccount />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-black bg-opacity-70 backdrop-blur-md rounded-xl p-6 flex flex-col gap-6 shadow-lg border border-red-600"
        >
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3">
            <img
              src="/shan.png"
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-white"
            />
          </div>

          {Object.keys(profile)
            .filter(key => key !== "photo")
            .map(key => (
              <motion.div
                key={key}
                animate={errors[key] ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                <input
                  type={key === "email" ? "email" : "text"}
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={profile[key]}
                  onChange={handleChange}
                  className="p-3 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-600 via-black-1000 to-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
                {errors[key] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </span>
                )}
              </motion.div>
            ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="bg-gradient-to-r from-red-600 via-black to-white text-white px-6 py-3 rounded-lg font-bold shadow-lg mt-4"
          >
            Save Profile
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
