"use client";
import React, { useState } from "react";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  Award,
  Truck,
  ShoppingBag,
} from "lucide-react";

const FeaturedProducers = () => {
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Mock data for featured producers
  const featuredProducers = [
    {
      id: 1,
      name: "Green Valley Farm",
      category: "Organic Farm",
      image: "🌱",
      rating: 4.9,
      reviewCount: 127,
      distance: "2.3 km",
      deliveryTime: "30-45 min",
      specialties: ["Organic Vegetables", "Fresh Herbs", "Seasonal Fruits"],
      featured: "Farm Fresh Daily",
      badge: "Certified Organic",
      priceRange: "$$",
      description:
        "Family-owned organic farm providing the freshest seasonal produce directly from field to table.",
      isOpen: true,
      freeDelivery: true,
    },
    {
      id: 2,
      name: "Artisan Bakery Co.",
      category: "Traditional Bakery",
      image: "🥖",
      rating: 4.8,
      reviewCount: 94,
      distance: "1.8 km",
      deliveryTime: "20-30 min",
      specialties: ["Sourdough Bread", "French Pastries", "Custom Cakes"],
      featured: "Award Winning",
      badge: "Master Baker",
      priceRange: "$$$",
      description:
        "Traditional bakery using time-honored techniques and locally sourced ingredients all to deliver quality products.",
      isOpen: true,
      freeDelivery: false,
    },
    {
      id: 3,
      name: "Mountain Honey",
      category: "Bee Farm",
      image: "🍯",
      rating: 4.7,
      reviewCount: 86,
      distance: "4.2 km",
      deliveryTime: "45-60 min",
      specialties: ["Raw Honey", "Beeswax Products", "Honeycomb"],
      featured: "Pure & Natural",
      badge: "Sustainable",
      priceRange: "$$",
      description:
        "Sustainable beekeeping operation producing pure, unprocessed honey and natural bee products.",
      isOpen: true,
      freeDelivery: true,
    },
    {
      id: 4,
      name: "Riverside Dairy",
      category: "Local Dairy",
      image: "🥛",
      rating: 4.6,
      reviewCount: 112,
      distance: "3.1 km",
      deliveryTime: "25-40 min",
      specialties: ["Fresh Milk", "Artisan Cheese", "Greek Yogurt"],
      featured: "Grass Fed",
      badge: "Family Farm",
      priceRange: "$$",
      description:
        "Third-generation family dairy farm with grass-fed cows and artisan cheese making.",
      isOpen: false,
      freeDelivery: true,
    },
    {
      id: 5,
      name: "Heritage Grains Mill",
      category: "Grain Mill",
      image: "🌾",
      rating: 4.8,
      reviewCount: 73,
      distance: "6.5 km",
      deliveryTime: "60-75 min",
      specialties: ["Stone Ground Flour", "Ancient Grains", "Milling Services"],
      featured: "Stone Ground",
      badge: "Heritage",
      priceRange: "$$$",
      description:
        "Historic grain mill preserving traditional stone-grinding methods for premium flours.",
      isOpen: true,
      freeDelivery: false,
    },
    {
      id: 6,
      name: "Craft Coffee Roasters",
      category: "Coffee Roastery",
      image: "☕",
      rating: 4.9,
      reviewCount: 156,
      distance: "1.2 km",
      deliveryTime: "15-25 min",
      specialties: ["Single Origin", "Custom Blends", "Cold Brew"],
      featured: "Freshly Roasted",
      badge: "Award Winner",
      priceRange: "$$$",
      description:
        "Small-batch coffee roastery specializing in ethically sourced beans and expert roasting.",
      isOpen: true,
      freeDelivery: true,
    },
  ];

  const ProducerCard = ({ producer }) => (
    <div className="relative bg-white rounded-xl shadow-2 hover:shadow-3 transition-all duration-300 group overflow-hidden">
      {/* Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-green text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Award className="w-3 h-3" />
          {producer.badge}
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={() => toggleFavorite(producer.id)}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-red-light-6 transition-colors duration-200"
      >
        <Heart
          className={`w-4 h-4 ${
            favorites.has(producer.id) ? "text-red fill-current" : "text-gray-5"
          }`}
        />
      </button>

      {/* Image/Icon Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-light-6 to-blue-light-5 flex items-center justify-center">
        <div className="text-6xl">{producer.image}</div>
        <div className="absolute bottom-3 right-3 flex gap-1">
          {producer.freeDelivery && (
            <div className="bg-green text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Free
            </div>
          )}
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              producer.isOpen ? "bg-green text-white" : "bg-gray-3 text-gray-6"
            }`}
          >
            {producer.isOpen ? "Open" : "Closed"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-dark group-hover:text-blue transition-colors">
            {producer.name}
          </h3>
          <span className="text-sm font-medium text-gray-6">
            {producer.priceRange}
          </span>
        </div>

        <p className="text-sm text-body mb-2">{producer.category}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow fill-current" />
            <span className="text-sm font-medium text-dark">
              {producer.rating}
            </span>
            <span className="text-sm text-gray-5">
              ({producer.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-5">
            <MapPin className="w-3 h-3" />
            {producer.distance}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-5">
            <Clock className="w-3 h-3" />
            {producer.deliveryTime}
          </div>
        </div>

        <p className="text-sm text-body mb-4 leading-relaxed">
          {producer.description}
        </p>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-6 mb-2">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {producer.specialties.slice(0, 2).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-1 text-gray-7 rounded text-xs"
              >
                {specialty}
              </span>
            ))}
            {producer.specialties.length > 2 && (
              <span className="px-2 py-1 bg-gray-1 text-gray-7 rounded text-xs">
                +{producer.specialties.length - 2} more
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-blue text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-dark transition-colors duration-200 flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            More
          </button>
          <button className="px-4 py-2.5 border border-gray-3 rounded-lg hover:bg-gray-1 transition-colors duration-200">
            <Phone className="w-4 h-4 text-gray-6" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden py-20 bg-gray-1">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section Title */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <div className="w-4 h-4 bg-green rounded-full flex items-center justify-center">
                <Award className="w-2.5 h-2.5 text-white" />
              </div>
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Featured Local Producers
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-6">Supporting Local</p>
              <p className="font-semibold text-green">Community First</p>
            </div>
          </div>
        </div>

        {/* Producers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {featuredProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12.5">
          <button className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-white text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent">
            View All Local Producers
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-16 border-t border-gray-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green mb-1">50+</div>
            <div className="text-sm text-gray-6">Local Producers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue mb-1">1000+</div>
            <div className="text-sm text-gray-6">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange mb-1">4.8★</div>
            <div className="text-sm text-gray-6">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red mb-1">24/7</div>
            <div className="text-sm text-gray-6">Online Ordering</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducers;
