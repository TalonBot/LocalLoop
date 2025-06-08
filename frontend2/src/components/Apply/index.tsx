"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ApplyForm = () => {
  const [businessName, setBusinessName] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName || !reason || files.length === 0) {
      toast.error("Please fill all fields and upload at least one PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("business_name", businessName);
    formData.append("reason", reason);
    files.forEach((file) => formData.append("documents", file));

    const loadingToast = toast.loading("Submitting application...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/consumer/upload-document`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error(data.error || "Application failed.");

      toast.success("✅ Successfully applied! Redirecting to homepage...");

      // Clear form
      setBusinessName("");
      setReason("");
      setFiles([]);

      // Redirect after short delay
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("❌ Error: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-center">Provider Application</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded resize-none h-28"
        />
      </div>

            {/* Upload PDFs */}
            <div className="space-y-4">
            <div className="relative group w-full">
                <label
                htmlFor="fileUpload"
                className="block cursor-pointer w-full text-center px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-md shadow-md overflow-hidden relative transition-all duration-300 hover:shadow-lg"
                >
                <span className="relative z-10">📎 Upload PDF Documents</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></span>
                <span className="absolute -left-10 top-0 h-full w-1/3 bg-white opacity-20 transform -skew-x-12 translate-x-0 group-hover:translate-x-full transition-transform duration-700 ease-out" />
                </label>
                <input
                type="file"
                id="fileUpload"
                multiple
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => {
                    if (!e.target.files) return;
                    const newFiles = Array.from(e.target.files);

                    // Limit: max 5 total files
                    const totalFiles = files.length + newFiles.length;
                    if (totalFiles > 5) {
                        alert("You can upload a maximum of 5 documents.");
                        return;
                    }

                    // Optional: allow PDF and TXT only
                    const allowedTypes = ["application/pdf", "text/plain"];
                    const validFiles = newFiles.filter((file) =>
                        allowedTypes.includes(file.type)
                    );

                    if (validFiles.length < newFiles.length) {
                        alert("Only PDF and TXT files are allowed.");
                    }

                    // Prevent duplicate names (optional)
                    setFiles((prev) => {
                        const existingNames = new Set(prev.map((f) => f.name));
                        const merged = [
                        ...prev,
                        ...validFiles.filter((f) => !existingNames.has(f.name)),
                        ];
                        return merged;
                    });
                    }}
                />
            </div>

            {/* Show selected files */}
            {files.length > 0 && (
                <ul className="space-y-2">
                {files.map((file, idx) => (
                    <li
                    key={idx}
                    className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded shadow-sm"
                    >
                    <span className="truncate">{file.name}</span>
                    <button
                        type="button"
                        onClick={() => {
                        setFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove"
                    >
                        🗑️
                    </button>
                    </li>
                ))}
                </ul>
            )}
            </div>


        <div className="relative group w-full">
        <button
            type="submit"
            className="block w-full text-center px-6 py-3 bg-gradient-to-br from-green-500 to-lime-600 text-white font-semibold rounded-md shadow-md overflow-hidden relative transition-all duration-300 hover:shadow-lg">
            <span className="relative z-10">🚀 Submit Application</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></span>
            <span className="absolute -left-10 top-0 h-full w-1/3 bg-white opacity-20 transform -skew-x-12 translate-x-0 group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </button>
        </div>

    </form>
  );
};

export default ApplyForm;
