import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Localloop",
  description: "Localloop",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
