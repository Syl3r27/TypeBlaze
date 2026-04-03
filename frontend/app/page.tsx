import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main>
    <Navbar/>
    <Hero />
    </main>
  );
}
