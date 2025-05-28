"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Edit3,
  User,
  Users,
  Home,
  Upload,
  Save,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  X,
} from "lucide-react";

interface ProviderProfile {
  id?: string;
  business_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  location?: string;
  profile_image?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  producer_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  unit: string;
  is_available: boolean;
  created_at: string;
  modified_at: string;
  product_images: {
    id: string;
    image_url: string;
    product_id: string;
  }[];
}

interface RevenueData {
  revenue: {
    orders: number;
    groupOrders: number;
    total: number;
  };
  timeframe: string;
  topProducts: {
    product_id: string;
    name: string;
    quantity: number;
    total_revenue: number;
    unit_price: number;
  }[];
  orderCount: number;
  groupOrderCount: number;
  timestamp: string;
}

interface Order {
  id: string;
  consumer_id: string;
  total_price: number;
  status: string;
  pickup_or_delivery: string;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      unit: string;
    };
  }[];
}

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [groupOrders, setGroupOrders] = useState([]);

  const [story, setStory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<ProviderProfile>({});
  const [products, setProducts] = useState<Product[]>([]);

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [timeframe, setTimeframe] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/provider/orders");
      setOrders(data);
    } catch (error) {
      showError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Move loadRevenueData to component level
  const loadRevenueData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiCall(`/provider/revenue?timeframe=${timeframe}`);
      setRevenueData(data);
    } catch (error) {
      showError("Failed to load revenue data");
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  // Add useEffect at component level
  useEffect(() => {
    loadRevenueData();
  }, [timeframe, loadRevenueData]);

  const PRODUCT_UNITS = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "piece", label: "Piece" },
    { value: "jar", label: "Jar" },
    { value: "bottle", label: "Bottle" },
    { value: "pack", label: "Pack" },
    { value: "dozen", label: "Dozen" },
    { value: "l", label: "Liter (L)" },
    { value: "ml", label: "Milliliter (mL)" },
  ];

  // API Base URL - adjust this to match your backend
  const API_BASE = "http://localhost:5000";

  // Utility function for API calls
  interface ApiOptions extends RequestInit {
    headers?: HeadersInit;
  }

  const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API request failed");
      }

      return await response.json();
    } catch (error) {
      setError(error instanceof Error ? error.message : "API request failed");
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadProfile();
    loadStory();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/product");
      // The API returns the array directly, so no need to access .products
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await apiCall("/provider/me");
      setProfile(data.provider || {});
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadStory = async () => {
    try {
      const data = await apiCall("/provider/story");
      setStory(data.story || "");
    } catch (error) {
      console.error("Failed to load story:", error);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag }, // Add this line
    { id: "group-orders", label: "Group Orders", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      product || {
        name: "",
        price: "",
        quantity_available: "",
        category: "Vegetables",
        unit: "piece",
        description: "",
        status: "active",
      }
    );
    const [images, setImages] = useState<File[]>([]);
    const [imagesPreviews, setImagesPreviews] = useState<string[]>(
      product?.product_images?.map((img) => img.image_url) || []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const removeImage = (index: number) => {
      // If it's an existing image (from product_images)
      if (index < (product?.product_images?.length || 0)) {
        const imageUrl = product.product_images[index].image_url;
        setRemovedImages((prev) => [...prev, imageUrl]);
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
      } else {
        // If it's a newly added image
        const adjustedIndex = index - (product?.product_images?.length || 0);
        setImages((prev) => prev.filter((_, i) => i !== adjustedIndex));
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
      }
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + imagesPreviews.length > 5) {
        showError("Maximum 5 images allowed");
        return;
      }

      // Create new image previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagesPreviews((prev) => [...prev, ...newPreviews]);
      setImages((prev) => [...prev, ...files]);
    };
    useEffect(() => {
      if (product?.product_images) {
        setImagesPreviews(product.product_images.map((img) => img.image_url));
      }
    }, [product]);

    const handleSubmit = async () => {
      if (!formData.name || !formData.price || !formData.quantity_available) {
        showError("Please fill in all required fields");
        return;
      }

      setIsSubmitting(true);
      try {
        const formDataToSend = new FormData();

        // Append product details
        Object.keys(formData).forEach((key) => {
          formDataToSend.append(key, formData[key]);
        });

        // Append new images
        images.forEach((image) => {
          formDataToSend.append("images", image);
        });

        // Append removed images
        removedImages.forEach((imageUrl) => {
          formDataToSend.append("remove_images", imageUrl);
        });

        let response;
        if (product) {
          response = await fetch(`${API_BASE}/product/${product.id}`, {
            method: "PUT",
            credentials: "include",
            body: formDataToSend,
          });
        } else {
          response = await fetch(`${API_BASE}/product/new`, {
            method: "POST",
            credentials: "include",
            body: formDataToSend,
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save product");
        }

        showSuccess(
          product
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        await loadProducts();
        onSave();
      } catch (error) {
        showError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Clean up image previews when component unmounts
    useEffect(() => {
      return () => {
        imagesPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      };
    }, [imagesPreviews]);

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Honey">Honey</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Bread">Bread</option>
                <option value="Meat">Meat</option>
                <option value="Beverages">Beverages</option>
                <option value="Crafts">Crafts</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity_available}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity_available: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-wrap gap-4 mb-4">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="ml-3 text-left">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB (max 5 images)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await apiCall(`/product/${productId}`, { method: "DELETE" });
      showSuccess("Product deleted successfully!");
      await loadProducts();
    } catch (error) {
      showError("Failed to delete product");
    }
  };

  const toggleProductAvailability = async (productId) => {
    try {
      await apiCall(`/product/${productId}/toggle`, { method: "PATCH" });
      showSuccess("Product availability updated!");
      await loadProducts();
    } catch (error) {
      showError("Failed to update product availability");
    }
  };

  const Orders = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600">
              When customers order your products, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul>
                        {order.order_items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} {item.product?.unit ?? "unit"} -{" "}
                            {item.product?.name ?? "Unknown Product"}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.pickup_or_delivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const Overview = () => {
    const activeProducts = products.filter((p) => p.is_available).length;

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading overview...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-12 w-12 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Est. Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${revenueData?.revenue.total.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Star className="h-12 w-12 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.rating?.toFixed(1) || "4.8"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products yet. Add your first product!
            </p>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {product.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ${product.price}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.is_available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.is_available ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Products = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {isAddingProduct && (
        <ProductForm
          onSave={() => setIsAddingProduct(false)}
          onCancel={() => setIsAddingProduct(false)}
          product={undefined}
        />
      )}

      {selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onSave={() => setSelectedProduct(null)}
          onCancel={() => setSelectedProduct(null)}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first product to the marketplace.
          </p>
          <button
            onClick={() => setIsAddingProduct(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  quantity_available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${product.price}/{product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.quantity_available} {product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                        product.is_available
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {product.is_available ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 p-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const GroupOrders = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [groupOrderForm, setGroupOrderForm] = useState({
      title: "",
      description: "",
      minOrder: "",
      deadline: "",
      productIds: [],
    });

    const handleCreateGroupOrder = async () => {
      try {
        await apiCall("/provider/group-orders", {
          method: "POST",
          body: JSON.stringify(groupOrderForm),
        });
        showSuccess("Group order created successfully!");
        setIsCreating(false);
        setGroupOrderForm({
          title: "",
          description: "",
          minOrder: "",
          deadline: "",
          productIds: [],
        });
      } catch (error) {
        showError("Failed to create group order");
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Group Orders</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group Order
          </button>
        </div>

        {isCreating && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">
              Create New Group Order
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={groupOrderForm.title}
                  onChange={(e) =>
                    setGroupOrderForm({
                      ...groupOrderForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={groupOrderForm.description}
                  onChange={(e) =>
                    setGroupOrderForm({
                      ...groupOrderForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Orders
                  </label>
                  <input
                    type="number"
                    value={groupOrderForm.minOrder}
                    onChange={(e) =>
                      setGroupOrderForm({
                        ...groupOrderForm,
                        minOrder: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={groupOrderForm.deadline}
                    onChange={(e) =>
                      setGroupOrderForm({
                        ...groupOrderForm,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroupOrder}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No group orders yet
          </h3>
          <p className="text-gray-600">
            Create group orders to allow bulk purchasing from consumers.
          </p>
        </div>
      </div>
    );
  };

  const Profile = () => {
    const [profileForm, setProfileForm] = useState(profile);
    const [storyForm, setStoryForm] = useState(story);
    const [profileImage, setProfileImage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleProfileUpdate = async () => {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        Object.keys(profileForm).forEach((key) => {
          if (profileForm[key]) formData.append(key, profileForm[key]);
        });
        if (profileImage) {
          formData.append("profile_image", profileImage);
        }

        await fetch(`${API_BASE}/providers/me`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });

        showSuccess("Profile updated successfully!");
        await loadProfile();
      } catch (error) {
        showError("Failed to update profile");
      } finally {
        setIsUpdating(false);
      }
    };

    const handleStoryUpdate = async () => {
      try {
        await apiCall("/provider/story", {
          method: "PUT",
          body: JSON.stringify({ story: storyForm }),
        });
        showSuccess("Story updated successfully!");
        setStory(storyForm);
      } catch (error) {
        showError("Failed to update story");
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm/Business Name
              </label>
              <input
                type="text"
                value={profileForm.business_name || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    business_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={profileForm.contact_person || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    contact_person: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileForm.email || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                value={profileForm.location || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      setProfileImage(e.target.files?.[0] || null)
                    }
                  />
                  <label
                    htmlFor="profile-image"
                    className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </label>
                  {profileImage && (
                    <span className="ml-3 text-sm text-gray-500">
                      {profileImage.name}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleProfileUpdate}
              disabled={isUpdating}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Our Story</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell your customers about your business
              </label>
              <textarea
                value={storyForm}
                onChange={(e) => setStoryForm(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your journey, values, and what makes your products special..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleStoryUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Story
              </button>
            </div>
          </div>
        </div>

        {/* Join Date Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span>
              Joined {new Date(profile.created_at || "").toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render main dashboard layout with components
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
          <button onClick={() => setSuccess("")} className="ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
          <button onClick={() => setError("")} className="ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen sticky top-0 border-r">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <nav className="mt-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium ${
                  activeTab === item.id
                    ? "text-green-600 bg-green-50 border-r-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {React.createElement(item.icon, { className: "w-5 h-5 mr-3" })}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && <Overview />}
          {activeTab === "products" && <Products />}
          {activeTab === "orders" && <Orders />} {/* Add this line */}
          {activeTab === "group-orders" && <GroupOrders />}
          {activeTab === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
