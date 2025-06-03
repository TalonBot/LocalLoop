import { useState } from "react";

const ConfirmPickupForm = ({ orderId, consumerId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [pickupNote, setPickupNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.API_BASE}/provider/pickup`, {
        credentials: "include",

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, consumerId, pickupNote }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage("Pickup confirmed and email sent to the consumer.");
      setPickupNote("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Pickup Message to Consumer:
      </label>
      <textarea
        required
        rows={4}
        className="w-full border border-gray-300 rounded p-2"
        placeholder="E.g., Please pick up your order at the market stall tomorrow between 9–11 AM."
        value={pickupNote}
        onChange={(e) => setPickupNote(e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {submitting ? "Sending..." : "Confirm Pickup"}
      </button>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  );
};

export default ConfirmPickupForm;
