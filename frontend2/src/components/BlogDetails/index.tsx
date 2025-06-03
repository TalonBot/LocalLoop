"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";

interface ProductImage {
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  product_images: ProductImage[];
}

interface Producer {
  producer: {
    full_name: string;
    profile_image_url?: string;
  };
  story?: string | null;
  certifications?: string[];
  products: {
    items: Product[];
  };
}

const ProducerDetails: React.FC = () => {
  const { id } = useParams();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/producers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducer({
          producer: data.producer,
          story: data.story?.story ?? null,
          certifications: data.certifications ?? [],
          products: data.products ?? { items: [] },
        });
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async (item: Product): Promise<void> => {
    setAddingToCart(item.id);
    dispatch(
      addItemToCart({
        id: item.id,
        title: item.name,
        price: item.price,
        discountedPrice: item.price,
        imgs: {
          thumbnails: item.product_images.map(
            (img: ProductImage) => img.image_url
          ),
          previews: item.product_images.map(
            (img: ProductImage) => img.image_url
          ),
        },
        image:
          item.product_images && item.product_images[0]
            ? item.product_images[0].image_url
            : null,
        quantity: 1,
      })
    );

    // Simulate loading state
    setTimeout(() => {
      setAddingToCart(null);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Loading producer details...</p>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Producer Not Found
          </h2>
          <p className="text-slate-600">
            The producer you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        title={producer?.producer?.full_name || "Loading..."}
        pages={["Producers", producer?.producer?.full_name || "Loading..."]}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f1f5f9\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            {/* Profile Image */}
            <div className="relative inline-block mb-6">
              {producer.producer.profile_image_url ? (
                <div className="relative">
                  <Image
                    className="rounded-full object-cover w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl"
                    src={producer.producer.profile_image_url}
                    alt={producer.producer.full_name}
                    width={160}
                    height={160}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/10"></div>
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-3xl border-4 border-white shadow-xl">
                  👤
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>

            {/* Producer Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {producer.producer.full_name}
            </h1>

            {/* Certifications Badge */}
            {producer.certifications && producer.certifications.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {producer.certifications
                  .slice(0, 3)
                  .map((cert: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      {cert}
                    </span>
                  ))}
                {producer.certifications.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
                    +{producer.certifications.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Producer Story */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-lg">📖</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Our Story
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {producer.story ||
                      "Every great producer has a story to tell. We're passionate about bringing you the finest products with a commitment to quality and sustainability. Our journey began with a simple mission: to connect communities with authentic, locally-sourced goods that make a difference."}
                  </p>
                </div>
              </div>

              {/* All Certifications */}
              {producer.certifications &&
                producer.certifications.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300 mt-8">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-emerald-600 text-lg">🏆</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Certifications & Standards
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {producer.certifications.map(
                        (cert: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                          >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                            <span className="text-emerald-800 font-medium">
                              {cert}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Products Available</span>
                    <span className="font-bold text-blue-600 text-xl">
                      {producer.products.items.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Certifications</span>
                    <span className="font-bold text-emerald-600 text-xl">
                      {producer.certifications
                        ? producer.certifications.length
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of premium products
            </p>
          </div>

          {producer.products.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                No Products Yet
              </h3>
              <p className="text-slate-600">
                This producer hasn&apos;t added any products to showcase.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {producer.products.items.map((product: Product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-slate-100">
                    {product.product_images && product.product_images[0] ? (
                      <Image
                        src={product.product_images[0].image_url}
                        alt={product.name}
                        width={400}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                        📦
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700">
                        Premium
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        €{product.price}
                      </div>
                      <div className="text-sm text-slate-500">Per unit</div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {addingToCart === product.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="mr-2">🛒</span>
                          Add to Cart
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Certifications List Section */}
      {producer.certifications && producer.certifications.length > 0 && (
        <section className="py-10 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
              All Certifications
            </h2>
            <ul className="list-disc list-inside text-lg text-slate-700 space-y-2">
              {producer.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
};

export default ProducerDetails;
