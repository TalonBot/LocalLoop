import React from "react";
import HeroFeature from "./HeroFeature";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-16 pt-32 bg-[#E5EAF4] mt-[140px]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Main hero message */}
          <div className="w-full lg:w-2/3 flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-blue font-semibold uppercase tracking-widest mb-4 text-sm">
              Welcome to LocalLoop
            </span>
            <h1 className="font-bold text-4xl md:text-5xl text-dark mb-6 leading-tight">
              Connecting Local Producers
              <br />
              with Consumers
            </h1>
            <p className="text-lg text-dark-4 mb-6 max-w-2xl">
              LocalLoop is your bridge to the freshest, highest-quality products
              from your region. We empower local farmers, artisans, and small
              businesses by making their goods easily accessible to you.
              Discover unique flavors, support your community, and enjoy a more
              sustainable way to shop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/shop-with-sidebar"
                className="inline-block bg-blue text-white font-medium px-8 py-3 rounded-md shadow hover:bg-blue-dark transition"
              >
                Browse Local Products
              </a>
              <a
                href="/about"
                className="inline-block bg-white border border-blue text-blue font-medium px-8 py-3 rounded-md shadow hover:bg-blue hover:text-white transition"
              >
                Learn More About Us
              </a>
            </div>
          </div>
          {/* Features on the right */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <HeroFeature />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
