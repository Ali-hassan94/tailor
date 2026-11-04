import Hero from "../Pages/Hero";
import Services from "../Components/Services"; // default import
import Services2 from "../Components/Services2"; // default import
import Footer from "../Components/Footer";
import Contact from "../Components/Contact";
import LatestDesigns from "../Components/LatestDesigns";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestDesigns />
      <Services />
      <Services2 />
      <Contact />
      {/* <Footer /> */}
    </>
  );
}
