"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProduceCountdown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Set to next harvest season or farmers market event
  const deadline = "June, 15, 2025";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-7.5 lg:p-10 xl:p-15 border border-green-100">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-emerald-600 text-sm mb-2.5">
              🌱 Fresh From Farm
            </span>

            <h2 className="font-bold text-gray-800 text-xl lg:text-3xl xl:text-4xl mb-3">
              Summer Harvest Season Begins Soon!
            </h2>

            <p className="text-gray-600 mb-4">
              Get ready for the freshest seasonal produce from local farmers.
              Pre-order your favorites and support your community!
            </p>

            {/* Countdown timer */}
            <div className="flex flex-wrap gap-4 mt-6">
              {/* Days */}
              <div className="text-center">
                <span className="min-w-[64px] h-14 font-semibold text-xl lg:text-2xl text-gray-800 rounded-lg flex items-center justify-center bg-white shadow-lg px-4 mb-2 border border-green-100">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-sm text-gray-600 text-center font-medium">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="text-center">
                <span className="min-w-[64px] h-14 font-semibold text-xl lg:text-2xl text-gray-800 rounded-lg flex items-center justify-center bg-white shadow-lg px-4 mb-2 border border-green-100">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-sm text-gray-600 text-center font-medium">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="text-center">
                <span className="min-w-[64px] h-14 font-semibold text-xl lg:text-2xl text-gray-800 rounded-lg flex items-center justify-center bg-white shadow-lg px-4 mb-2 border border-green-100">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-sm text-gray-600 text-center font-medium">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="text-center">
                <span className="min-w-[64px] h-14 font-semibold text-xl lg:text-2xl text-gray-800 rounded-lg flex items-center justify-center bg-white shadow-lg px-4 mb-2 border border-green-100">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-sm text-gray-600 text-center font-medium">
                  Seconds
                </span>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="/group-orders"
                className="inline-flex font-medium text-sm text-black bg-emerald-600 py-3 px-6 rounded-lg ease-out duration-200 hover:bg-emerald-700 shadow-lg"
              >
                Pre-Order Now
              </a>
              <a
                href="#"
                className="inline-flex font-medium text-sm text-emerald-600 bg-white py-3 px-6 rounded-lg ease-out duration-200 hover:bg-gray-50 border border-emerald-200"
              >
                Browse Farmers
              </a>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="hidden sm:block absolute right-0 bottom-0 -z-1 opacity-20">
            <div className="w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full blur-3xl"></div>
          </div>

          {/* You can replace this with actual produce images */}
          <div className="hidden lg:block absolute right-8 xl:right-16 bottom-8 xl:bottom-12 -z-1">
            <div className="flex flex-col space-y-4 opacity-30">
              <div className="w-20 h-20 bg-red-200 rounded-full flex items-center justify-center text-2xl">
                🍎
              </div>
              <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-xl">
                🥕
              </div>
              <div className="w-18 h-18 bg-green-200 rounded-full flex items-center justify-center text-2xl">
                🥬
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProduceCountdown;
