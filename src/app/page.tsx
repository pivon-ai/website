import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BackgroundMesh from "@/components/BackgroundMesh";
import Leistungen from "@/components/sections/Leistungen";
import Vorgehen from "@/components/sections/Vorgehen";
import UnserAnspruch from "@/components/sections/UnserAnspruch";
import UeberUns from "@/components/sections/UeberUns";
import Kontakt from "@/components/sections/Kontakt";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative">
        <BackgroundMesh />
        <Hero />
        <main className="relative">
          <Leistungen />
          <Vorgehen />
          <UnserAnspruch />
          <UeberUns />
          <Kontakt />
        </main>
      </div>
      <Footer />
    </>
  );
}
