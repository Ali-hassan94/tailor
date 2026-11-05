// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Navbar from "./Components/Navbar";
// import Footer from "./Components/Footer";

// import Home from "./Pages/Home";
// import Order from "./Pages/Order";
// import Measurements from "./Pages/Measurements";
// import PhysicalMeasurements from "./Pages/PhysicalMeasurements";
// import Booking from "./Pages/Booking";
// import Portfolio from "./Pages/Portfolio";
// import Profile from "./Pages/Profile";
// import Dashboard from "./Pages/Dashboard";
// import Register from "./Pages/Register";
// import Login from "./Pages/Login";
// import AdminAddDesign from "./Pages/AdminAddDesign";
// import Contact from "./Components/Contact";

// function App() {
//   return (
//     <Router>
//       <Navbar />

//       <Routes>
//         {/* Public Home */}
//         <Route path="/" element={<Home />} />
//         <Route path="/Home" element={<Home />} />

//         {/* Other pages */}
//         <Route path="/order" element={<Order />} />
//         <Route path="/measurements" element={<Measurements />} />
//         <Route
//           path="/PhysicalMeasurements"
//           element={<PhysicalMeasurements />}
//         />
//         <Route path="/booking" element={<Booking />} />
//         <Route path="/portfolio" element={<Portfolio />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/dashboard" element={<Dashboard />} />

//         {/* Auth */}
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />

//         {/* Admin */}
//         <Route path="/AdminAddDesign" element={<AdminAddDesign />} />

//         {/* Contact */}
//         <Route path="/Contact" element={<Contact />} />
//       </Routes>

//       <Footer />
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Order from "./Pages/Order";
import PhysicalMeasurements from "./Pages/PhysicalMeasurements";
import Booking from "./Pages/Booking";
import Portfolio from "./Pages/Portfolio";
import Profile from "./Pages/Profile";
import Dashboard from "./Pages/Dashboard";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import AdminAddDesign from "./Pages/AdminAddDesign";
import ManageDesigns from "./Pages/ManageDesigns";
import ForgotPassword from "./Pages/ForgotPassword";
import ManageStaff from "./Pages/ManageStaff";
import Contact from "./Components/Contact";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Toaster position="top-right" />
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />

            <Route path="/order" element={<Order />} />
            <Route
              path="/PhysicalMeasurements"
              element={<PhysicalMeasurements />}
            />
            <Route path="/booking" element={<Booking />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/AdminAddDesign" element={<AdminAddDesign />} />
            <Route path="/manage-designs" element={<ManageDesigns />} />
            <Route path="/manage-staff" element={<ManageStaff />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/Contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
