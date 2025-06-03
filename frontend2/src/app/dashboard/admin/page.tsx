"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Users,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Clock,
  Download,
} from "lucide-react";

const API_BASE_URL = process.env.API_BASE || "http://localhost:5000";

const AdminDashboard = () => {
  const [adminNotes, setAdminNotes] = useState({});
  const [showRejectPopup, setShowRejectPopup] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [currentRejectId, setCurrentRejectId] = React.useState(null);

  const [activeTab, setActiveTab] = useState("applications");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [applications, setApplications] = useState([]);
  const [approvedProviders, setApprovedProviders] = useState([]);
  const [loading, setLoading] = useState({
    applications: true,
    providers: true,
  });
  const [error, setError] = useState({
    applications: null,
    providers: null,
  });

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "applications" && applications.length === 0) {
      fetchApplications();
    }
    if (activeTab === "invoices" && approvedProviders.length === 0) {
      fetchApprovedProviders();
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading((prev) => ({ ...prev, applications: true }));
    setError((prev) => ({ ...prev, applications: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError((prev) => ({ ...prev, applications: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, applications: false }));
    }
  };

  const fetchApprovedProviders = async () => {
    setLoading((prev) => ({ ...prev, providers: true }));
    setError((prev) => ({ ...prev, providers: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/admin/providers`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch providers");
      const data = await response.json();
      setApprovedProviders(data);
    } catch (err) {
      setError((prev) => ({ ...prev, providers: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, providers: false }));
    }
  };

  const handleReview = async (id, status, adminNote) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/applications/${id}/review`,
        {
          credentials: "include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            admin_notes: adminNote,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error:", data.error);
        alert(`Failed to ${status} application`);
        return;
      }

      alert(`Application ${status} successfully`);

      await fetchApplications();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong");
    }
  };

  const handleApprove = (id) => {
    handleReview(id, "approved", adminNotes[id] || "");
  };

  const handleReject = (id) => {
    setCurrentRejectId(id);
    setRejectReason("");
    setShowRejectPopup(true);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedMonth || !selectedYear || !selectedProvider) {
      alert("Please select month, year, and provider to generate invoice");
      return;
    }

    try {
      // 1) Fetch invoice JSON data
      const dataResponse = await fetch(
        `${API_BASE_URL}/admin/profits/${selectedProvider}?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!dataResponse.ok) throw new Error("Failed to fetch invoice data");

      const invoiceData = await dataResponse.json();

      // 2) Send JSON data to PDF generator endpoint
      const pdfResponse = await fetch(`${API_BASE_URL}/admin/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      });

      if (!pdfResponse.ok) throw new Error("Failed to generate PDF");

      const blob = await pdfResponse.blob();

      // 3) Create a download link for the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const monthLabel =
        months.find((m) => m.value === selectedMonth)?.label || selectedMonth;
      a.download = `invoice_${selectedProvider}_${monthLabel}_${selectedYear}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to generate invoice: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Loading and error states
  if (loading.applications && activeTab === "applications") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading applications...
      </div>
    );
  }

  if (error.applications && activeTab === "applications") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Error: {error.applications}
      </div>
    );
  }

  if (loading.providers && activeTab === "invoices") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading providers...
      </div>
    );
  }

  if (error.providers && activeTab === "invoices") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Error: {error.providers}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Localloop Admin
                </h1>
                <p className="text-sm text-gray-500">
                  Provider Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("applications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "applications"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Provider Applications</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "invoices"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Invoice Generation</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "applications" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Provider Applications
              </h2>
              <p className="text-gray-600">
                Review and manage provider applications to join Localloop
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {
                        applications.filter((app) => app.status === "pending")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Approved
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {
                        applications.filter((app) => app.status === "approved")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Rejected
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {
                        applications.filter((app) => app.status === "rejected")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Applications
                </h3>
              </div>

              {applications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No applications found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <div key={application.id} className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {application.users?.full_name || "N/A"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Applied on{" "}
                            {new Date(
                              application.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Description:
                          </p>
                          <p className="text-sm text-gray-600">
                            {application.reason}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Certifications:
                          </p>
                          {application.documents.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-blue-600">
                              {application.documents.map((doc) => (
                                <li key={doc.path}>
                                  {doc.url ? (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {doc.path.split("/").pop()}
                                    </a>
                                  ) : (
                                    <span>{doc.path} (Unavailable)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-600">
                              No documents uploaded.
                            </p>
                          )}
                        </div>
                      </div>

                      {application.status === "pending" && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setCurrentRejectId(application.id);
                              setRejectReason(""); // clear previous input
                              setShowRejectPopup(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>

                          <button
                            onClick={() => handleApprove(application.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {showRejectPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                Reason for rejection
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="Enter rejection reason..."
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectPopup(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleReview(currentRejectId, "rejected", rejectReason);
                    setShowRejectPopup(false);
                  }}
                  disabled={!rejectReason.trim()}
                  className={`px-4 py-2 rounded text-white ${
                    rejectReason.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invoice Generation
              </h2>
              <p className="text-gray-600">
                Generate monthly invoices for approved providers
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Month Selection */}
                <div>
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Month
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">Choose month...</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selection */}
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Year
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">Choose year...</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provider Selection */}
                <div>
                  <label
                    htmlFor="provider"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Select Provider
                  </label>
                  <select
                    id="provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="">Choose provider...</option>
                    {approvedProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateInvoice}
                  disabled={
                    !selectedMonth || !selectedYear || !selectedProvider
                  }
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Invoice
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Invoice Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Invoices include:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Total sales for the selected month</li>
                        <li>Commission calculation (15% platform fee)</li>
                        <li>Number of transactions processed</li>
                        <li>Provider details and contact information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Providers List */}
            <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Approved Providers
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Providers eligible for invoice generation
                </p>
              </div>
              {approvedProviders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No approved providers found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {approvedProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {provider.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {provider.users?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
