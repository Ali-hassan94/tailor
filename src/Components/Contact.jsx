// import React, { useEffect } from "react";
// import { motion } from "framer-motion";
// import AOS from "aos";
// import "aos/dist/aos.css";

// const ContactPage = () => {
//   useEffect(() => {
//     AOS.init({ duration: 1000 });
//   }, []);

//   return (
//     <div className="min-h-screen  bg-black text-white overflow-x-hidden">
//       {/* Hero Section */}
//       <section className="text-center py-16 bg-red-700  px-4 sm:px-8 md:px-16">
//         <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold pt-20">
//           Contact Us
//         </h1>
//         <p className="mt-4 text-sm sm:text-lg md:text-xl">
//           Reach out for custom tailoring, inquiries, or appointments
//         </p>
//       </section>

//       {/* Contact Info + Form Section */}
//       <section className="py-16 flex flex-col lg:flex-row justify-center items-start gap-8 px-4 sm:px-8 md:px-16">
//         {/* Contact Info */}
//         <motion.div
//           className="flex-1 bg-white text-black rounded-xl shadow-lg p-6 sm:p-8"
//           data-aos="fade-right"
//         >
//           <h2 className="text-2xl font-bold text-red-700 mb-4 sm:mb-6">
//             Get in Touch
//           </h2>
//           <p className="mb-2 sm:mb-4">
//             Address: 123 Tailor Street, Fashion City
//           </p>
//           <p className="mb-2 sm:mb-4">Phone: +92 3143638733</p>
//           <p className="mb-2 sm:mb-4">Email: info@tailorcompany.com</p>
//           <p className="mb-2 sm:mb-4">
//             Working Hours: Mon-Sat 10:00 AM - 7:00 PM
//           </p>
//         </motion.div>

//         {/* Contact Form */}
//         <motion.form
//           className="flex-1 bg-white text-black rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-4"
//           data-aos="fade-left"
//         >
//           <h2 className="text-2xl font-bold text-red-700 mb-2 sm:mb-4">
//             Send a Message
//           </h2>
//           <input
//             type="text"
//             placeholder="Your Name"
//             className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
//           />
//           <input
//             type="email"
//             placeholder="Your Email"
//             className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
//           />
//           <input
//             type="text"
//             placeholder="Subject"
//             className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
//           />
//           <textarea
//             rows="5"
//             placeholder="Your Message"
//             className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
//           ></textarea>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="bg-red-700 text-white py-3 rounded-lg font-bold mt-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
//           >
//             Send Message
//           </motion.button>
//         </motion.form>
//       </section>

//       {/* Google Map Section */}
//       <section className="py-16 px-4 sm:px-8 md:px-16">
//         <h2 className="text-2xl text-center font-bold text-red-700 mb-8">
//           Find Us Here
//         </h2>
//         <div className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
//           <iframe
//             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.580717695119!2d72.93686221521295!3d31.475662981410074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919031c8f0a2d3b%3A0xabcdef1234567890!2sTailor%20Shop!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
//             width="100%"
//             height="100%"
//             allowFullScreen=""
//             loading="lazy"
//             className="border-0"
//           ></iframe>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ContactPage;

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Fixed WhatsApp Icon */}
      {/* WhatsApp Icon Fixed Right */}
      <a
        href="https://wa.me/923143638733"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-20 z-50 bg-green-500 p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <img src="/wt.png" alt="WhatsApp" className="w-14 h-14" />
      </a>

      {/* Hero Section */}
      <section className="text-center py-16 bg-red-700 px-4 sm:px-8 md:px-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold pt-20">
          Contact Us
        </h1>
        <p className="mt-4 text-sm sm:text-lg md:text-xl">
          Reach out for custom tailoring, inquiries, or appointments
        </p>
      </section>

      {/* Contact Info + Form Section */}
      <section className="py-16 flex flex-col lg:flex-row justify-center items-start gap-8 px-4 sm:px-8 md:px-16">
        {/* Contact Info */}
        <motion.div
          className="flex-1 bg-white text-black rounded-xl shadow-lg p-6 sm:p-8"
          data-aos="fade-right"
        >
          <h2 className="text-2xl font-bold text-red-700 mb-4 sm:mb-6">
            Get in Touch
          </h2>
          <p className="mb-2 sm:mb-4">
            Address: mahala Noor park Street No 4 near Chok Pakptan Sahiwal,
            Fashion City
          </p>
          <p className="mb-2 sm:mb-4">Phone: +92 3143638733</p>
          <p className="mb-2 sm:mb-4">Email: shantailor@gmail.com</p>
          <p className="mb-2 sm:mb-4">
            Working Hours: Mon-Thursday 10:00 AM - 7:00 PM
          </p>
          <p className="mb-2 sm:mb-4">Close(Leave): Friday</p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          className="flex-1 bg-white text-black rounded-xl shadow-lg p-6 sm:p-8 flex flex-col gap-4"
          data-aos="fade-left"
          onSubmit={e => {
            e.preventDefault();
            const name = e.target[0].value;
            const email = e.target[1].value;
            const subject = e.target[2].value;
            const message = e.target[3].value;
            const text = `Name: ${name}%0AEmail: ${email}%0ASubject: ${subject}%0AMessage: ${message}`;
            window.open(`https://wa.me/923143638733?text=${text}`, "_blank");
          }}
        >
          <h2 className="text-2xl font-bold text-red-700 mb-2 sm:mb-4">
            Send a Message
          </h2>
          <input
            type="text"
            placeholder="Your Name"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
            required
          />
          <textarea
            rows="5"
            placeholder="Your Message"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 w-full"
            required
          ></textarea>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-700 text-white py-3 rounded-lg font-bold mt-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
          >
            Send Message
          </motion.button>
        </motion.form>
      </section>

      {/* Google Map Section */}
      <section className="py-16 px-4 sm:px-8 md:px-16  text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Find Us Here</h2>
        <p className="mb-4  text-white">
          Click the button below to open our location in Google Maps
        </p>
        <div className="mt-11">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Mahala+Noor+Park+Street+No+4+near+Chok+Pakpatan+Sahiwal"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-700  text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-red-800 transition-colors"
          >
            Open in Google Maps
          </a>
          ch
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
