import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const TailorCard = ({ title, description, image, fullImage }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleLearnMore = () => {
    setShowDescription(prev => !prev);
  };

  return (
    <motion.div
      className="card"
      whileHover={
        fullImage
          ? {
              scale: 1.05,
              rotate: 1,
              boxShadow: "0 25px 50px rgba(255,0,0,0.6)",
            }
          : { scale: 1.05, boxShadow: "0 10px 25px rgba(255,0,0,0.4)" }
      }
      transition={{ type: "spring", stiffness: 300 }}
      data-aos="fade-up"
      style={{
        background: fullImage ? "transparent" : "white",
        border: fullImage ? "none" : "2px solid red",
        borderRadius: "20px",
        padding: fullImage ? "0" : "20px",
        width: fullImage ? "400px" : "350px",
        height: fullImage ? "500px" : "auto",
        margin: "20px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <motion.img
        src={image}
        alt={title}
        style={{
          width: "100%",
          height: fullImage ? "100%" : "250px",
          objectFit: "cover",
          borderRadius: fullImage ? "20px" : "12px",
        }}
        whileHover={fullImage ? { scale: 1.1 } : {}}
      />
      {!fullImage && (
        <>
          {title && (
            <h2
              style={{
                color: "red",
                margin: "15px 0 10px",
                textAlign: "center",
              }}
            >
              {title}
            </h2>
          )}

          {showDescription && description && (
            <p
              style={{
                color: "#333",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              {description}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLearnMore}
            style={{
              padding: "10px 25px",
              borderRadius: "8px",
              border: "none",
              background: "red",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 5px 15px rgba(255,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
          >
            {showDescription ? "Hide" : "Learn More"}
          </motion.button>
        </>
      )}
    </motion.div>
  );
};

const Services = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const cardsData = [
    { image: "/shan2.png", fullImage: true },
    { image: "/arshid1.png", fullImage: true },
    { image: "/ah1.png", fullImage: true },
    {
      title: "Kurta Design",
      description: "Elegant traditional kurta for boys.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgghzgcZWLzevFyvzEPGJm0nI30R-NhOw50nVKjGAwwjMo4ma-9Oidg3w&s",
    },
    {
      title: "Modern Shirt",
      description: "Trendy casual shirt for young boys.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZQpaPnDzrioIsZvabTd1SDEhP7TKzm9l8w&s",
    },
    {
      title: "Designer Pants",
      description: "Stylish pants for modern boys.",
      image:
        "https://i.pinimg.com/564x/d4/9f/b5/d49fb59dbbe21c4765e52f0e99b5d186.jpg",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        background: "#000",
        padding: "50px 20px",
      }}
    >
      {cardsData.map((card, index) => (
        <TailorCard key={index} {...card} />
      ))}
    </div>
  );
};

export default Services;
