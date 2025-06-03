import React from "react";
import { FaTractor, FaLeaf, FaHandsHelping, FaLock } from "react-icons/fa";

const featureData = [
  {
    icon: <FaTractor size={36} style={{ color: "#2563eb" }} />, // blue-600
    title: "Direct from Local Producers",
    description:
      "Buy fresh products straight from your community’s farmers and artisans.",
  },
  {
    icon: <FaLeaf size={36} style={{ color: "#16a34a" }} />, // green-600
    title: "Sustainable Shopping",
    description:
      "Support eco-friendly practices and reduce your carbon footprint.",
  },
  {
    icon: <FaHandsHelping size={36} style={{ color: "#eab308" }} />, // yellow-500
    title: "Community Support",
    description:
      "Every purchase helps strengthen local businesses and families.",
  },
  {
    icon: <FaLock size={36} style={{ color: "#374151" }} />, // gray-700
    title: "Secure & Simple Payments",
    description:
      "Enjoy safe, fast, and easy checkout with multiple payment options.",
  },
];

const HeroFeature = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      {featureData.map((item, key) => (
        <div
          className="flex items-start gap-4 bg-white rounded-lg shadow p-4"
          key={key}
        >
          {item.icon}
          <div>
            <h3 className="font-semibold text-base text-dark mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-dark-4">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroFeature;
