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
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store"; // adjust path as needed
import ConfirmPickupForm from "../../../components/ConfirmPickup"; // adjust path as needed

interface ProviderProfile {
  id?: string;

  email?: string;

  location?: string;
  profile_image_url?: string;
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

interface BaseDeliveryDetail {
  address: string;
  country?: string;
  city: string;
  additional_info?: string | null;
  created_at: string;
}

interface ProductInfo {
  id?: string;
  name: string;
  unit: string;
  producer_id?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: ProductInfo;
}

interface IndividualOrder {
  type: "individual";
  order_id: string;
  consumer_id: string;
  status: string;
  pickup_or_delivery: string;
  finished: boolean;
  created_at: string;
  item: OrderItem;
  delivery_details: BaseDeliveryDetail[];
  total_price: number;
}

interface GroupOrder {
  finished: any;
  group_order_participant_id: string;
  type: "group";
  group_order_id: string;
  participant_user_id: string;
  paid: boolean;
  joined_at: string;
  created_at: string;
  item: OrderItem;
  delivery_details: BaseDeliveryDetail[];
  total_price: number;
}

type Order = IndividualOrder | GroupOrder;

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
  const [availableProducts, setAvailableProducts] = useState([]);
  const userId = useSelector((state: RootState) => state.authReducer.user?.id);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGroupOrders();
    fetchProducts();
  }, []);

  const fetchGroupOrders = async () => {
    try {
      const response = await apiCall("/provider/group-orders");
      setGroupOrders(response.groupOrders);
    } catch (err) {
      showError("Failed to fetch group orders");
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await apiCall("/product");
      setAvailableProducts(products);
    } catch (err) {
      showError("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchRating = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/users/producer/${userId}/average-rating`
        );
        const data = await res.json();
        setAverageRating(data.average_rating);
        setRatingCount(data.count);
      } catch (error) {
        console.error("Failed to fetch rating", error);
      }
    };

    fetchRating();
  }, [userId]);

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

  // Utility function for API calls
  interface ApiOptions extends RequestInit {
    headers?: HeadersInit;
  }

  const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}${endpoint}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
          ...options,
        }
      );

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

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag }, // Add this line
    { id: "group-orders", label: "Group Orders", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
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
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/product/${product.id}`,
            {
              method: "PUT",
              credentials: "include",
              body: formDataToSend,
            }
          );
        } else {
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/product/new`,
            {
              method: "POST",
              credentials: "include",
              body: formDataToSend,
            }
          );
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

  const handleMarkAsFinished = async (
    orderId: string,
    isGroupOrder: boolean = false
  ) => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE}/provider/orders/${orderId}/finish?isGroupOrder=${isGroupOrder}`;

      const response = await fetch(endpoint, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark order as finished");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.type === "individual" && order.order_id === orderId) {
            return { ...order, finished: true };
          }
          if (
            order.type === "group" &&
            order.group_order_participant_id === orderId
          ) {
            return { ...order, finished: true };
          }
          return order;
        })
      );

      alert("Order marked as finished successfully!");
    } catch (error) {
      alert("Error marking order as finished: " + error.message);
    }
  };

  const Orders = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openModal = (order, item = null) => {
      let consumerId = null;
      let deliveryDetails = null;

      if (order.type === "individual") {
        consumerId = order.consumer_id;
        deliveryDetails = order.delivery_details?.[0] ?? null;
      } else if (order.type === "group") {
        consumerId = order.participant_user_id;
        deliveryDetails = order.delivery_details?.[0] ?? null;
      }

      setSelectedItem({ order, item, consumerId, deliveryDetails });
      setShowModal(true);
    };

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      );
    }

    return (
      <div>
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
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, idx) => {
                  if (order.type === "individual") {
                    return (
                      <tr key={order.order_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.order_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul>
                            <li>
                              {order.item.quantity} {order.item.product.unit} -{" "}
                              {order.item.product.name}
                            </li>
                          </ul>
                          <button
                            className="mt-2 text-blue-600 hover:underline text-sm"
                            onClick={() => openModal(order, order.item)}
                          >
                            View Details
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.pickup_or_delivery}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.finished ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Finished
                            </span>
                          ) : (
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              onClick={() =>
                                handleMarkAsFinished(order.order_id)
                              }
                            >
                              Mark as Finished
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  } else if (order.type === "group") {
                    return (
                      <tr
                        key={`${order.group_order_id}-${order.item.id}-${idx}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.group_order_id.slice(0, 8)}...
                          <br />
                          <small className="text-gray-400">
                            Participant: {order.participant_user_id.slice(0, 8)}
                            ...
                          </small>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul>
                            <li>
                              {order.item.quantity} {order.item.product.unit} -{" "}
                              {order.item.product.name}
                            </li>
                          </ul>
                          <button
                            className="mt-2 text-blue-600 hover:underline text-sm"
                            onClick={() => openModal(order, order.item)}
                          >
                            View Details
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.paid
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.paid ? "paid" : "Not Paid"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.delivery_details?.length > 0
                            ? "Delivery"
                            : "Pickup"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.finished ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Finished
                            </span>
                          ) : (
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              onClick={() =>
                                handleMarkAsFinished(
                                  order.group_order_participant_id,
                                  true
                                )
                              }
                            >
                              Mark as Finished
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>

              <h3 className="text-lg font-semibold mb-4">Order Item Details</h3>

              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Product:</strong>{" "}
                  {selectedItem.item?.product?.name || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong>{" "}
                  {selectedItem.item?.quantity || "N/A"}
                </p>

                {/* Delivery Info */}
                {selectedItem.deliveryDetails && (
                  <>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedItem.deliveryDetails.address || "-"}
                    </p>
                    <p>
                      <strong>City:</strong>{" "}
                      {selectedItem.deliveryDetails.city || "-"}
                    </p>
                    <p>
                      <strong>Country:</strong>{" "}
                      {selectedItem.deliveryDetails.country || "-"}
                    </p>
                    {selectedItem.deliveryDetails.additional_info && (
                      <p>
                        <strong>Additional Info:</strong>{" "}
                        {selectedItem.deliveryDetails.additional_info}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Show confirm pickup form only for pickup orders */}
              {selectedItem.order.pickup_or_delivery === "pickup" && (
                <ConfirmPickupForm
                  orderId={selectedItem.order.id}
                  consumerId={selectedItem.consumerId}
                />
              )}
            </div>
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
                  {averageRating !== null ? averageRating.toFixed(1) : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  ({ratingCount} review{ratingCount !== 1 ? "s" : ""})
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
      description: "",
      products: [],
    });

    const handleProductToggle = (productId, max_quantity) => {
      setGroupOrderForm((prevForm) => {
        const others = prevForm.products.filter(
          (p) => p.product_id !== productId
        );
        if (max_quantity && max_quantity > 0) {
          return {
            ...prevForm,
            products: [...others, { product_id: productId, max_quantity }],
          };
        }
        return { ...prevForm, products: others };
      });
    };

    const handleCreateGroupOrder = async () => {
      try {
        await apiCall("/provider/group-orders", {
          method: "POST",
          body: JSON.stringify(groupOrderForm),
        });
        showSuccess("Group order created!");
        setGroupOrderForm({ description: "", products: [] });
        setIsCreating(false);
        fetchGroupOrders(); // refresh list
      } catch (error) {
        showError("Failed to create group order");
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Group Orders</h2>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? "Cancel" : "Create Group Order"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products & Max Quantity
                </label>
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const selected = groupOrderForm.products.find(
                      (p) => p.product_id === product.id
                    );
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between border px-4 py-2 rounded-md"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            Available: {product.quantity_available}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={(e) =>
                              handleProductToggle(
                                product.id,
                                e.target.checked ? 1 : null
                              )
                            }
                          />
                          <input
                            type="number"
                            min={1}
                            max={product.quantity_available}
                            disabled={!selected}
                            value={selected?.max_quantity || ""}
                            onChange={(e) =>
                              handleProductToggle(
                                product.id,
                                parseInt(e.target.value, 10) || null
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
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

        <div className="grid gap-6">
          {groupOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No group orders yet
              </h3>
              <p className="text-gray-600">
                Create group orders to allow bulk purchasing from consumers.
              </p>
            </div>
          ) : (
            groupOrders.map((order) => {
              const totalQuantity = order.maxQuantity + order.currentOrders;
              const progressPercent = totalQuantity
                ? Math.round((order.currentOrders / totalQuantity) * 100)
                : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.title || "Group Order"}
                      </h3>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Total Quantity: {totalQuantity}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        order.maxQuantity === 0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.maxQuantity === 0 ? "Completed" : "Open"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>
                        Progress: {order.currentOrders}/{totalQuantity}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  const Profile = () => {
    const [profileForm, setProfileForm] = useState({
      full_name: "",
      email: "",
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [storyForm, setStoryForm] = useState<string>("");
    const [profile, setProfile] = useState<any>(null);
    const [certifications, setCertifications] = useState<string[]>([]);
    const [newCert, setNewCert] = useState<string>("");
    const [isSavingAll, setIsSavingAll] = useState(false);

    useEffect(() => {
      const loadInitialData = async () => {
        try {
          const profileRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/provider/me`,
            {
              credentials: "include",
            }
          );
          const profileData = await profileRes.json();
          setProfile(profileData);

          setProfileForm({
            full_name: profileData.provider.full_name || "",
            email: profileData.provider.email || "",
          });

          const storyRes = await apiCall("/provider/story");
          setStoryForm(storyRes.story || "");
          setCertifications(storyRes.certifications || []);
        } catch (err) {
          showError("Failed to load profile data.");
        }
      };

      loadInitialData();
    }, []);

    // Cleanup object URL when component unmounts or when profileImage changes
    useEffect(() => {
      return () => {
        if (profileImage) {
          URL.revokeObjectURL(profileImage as any);
        }
      };
    }, [profileImage]);

    const handleSaveAll = async () => {
      setIsSavingAll(true);
      try {
        const formData = new FormData();
        formData.append("full_name", profileForm.full_name);
        if (profileImage) {
          formData.append("profile_image", profileImage);
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/provider/me`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });

        await apiCall("/provider/story", {
          method: "PUT",
          body: JSON.stringify({
            story: storyForm,
            certifications,
          }),
        });

        showSuccess("All changes saved successfully!");
      } catch (error) {
        showError("Failed to save some changes.");
      } finally {
        setIsSavingAll(false);
      }
    };

    if (!profile) {
      return <div>Loading profile...</div>;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profileForm.full_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, full_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (read-only)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="New profile"
                    className="w-20 h-20 object-cover"
                  />
                ) : profile?.provider?.profile_image_url ? (
                  <img
                    src={profile.provider.profile_image_url}
                    alt="Profile"
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400 m-6" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="profile-image"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
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
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Story
            </label>
            <textarea
              value={storyForm}
              onChange={(e) => setStoryForm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="Add new certification"
              />
              <button
                onClick={() => {
                  if (newCert.trim() !== "") {
                    setCertifications([...certifications, newCert.trim()]);
                    setNewCert("");
                  }
                }}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>

            {certifications.length > 0 && (
              <ul className="mt-3 space-y-1">
                {certifications.map((cert, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md"
                  >
                    <span>{cert}</span>
                    <button
                      onClick={() =>
                        setCertifications(
                          certifications.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isSavingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
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
