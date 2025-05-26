import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />

      <PromoBanner />
      <BestSeller />
      <CounDown />
    </main>
  );
};

export default Home;
