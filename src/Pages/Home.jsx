import Hero from "../Pages/Hero";
import Services from "../Components/Services"; // default import
import Services2 from "../Components/Services2"; // default import
import Footer from "../Components/Footer";
import Contact from "../Components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Services2 />
      <Contact />
      {/* <Footer /> */}
    </>
  );
}
