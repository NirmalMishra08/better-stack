import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dialog } from "@headlessui/react";

interface CreateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMonitorModal({ isOpen, onClose }: CreateMonitorModalProps) {
  const [form, setForm] = useState({
    url: "",
    method: "GET",
    type: "HTTP",
    interval: 60,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/monitors", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // adjust based on your auth setup
        },
      });

      toast.success(res.data.message || "Monitor created!");
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to create monitor";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800">
            Create New Monitor
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">URL</label>
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Method</label>
                <select
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Interval (sec)</label>
                <input
                  type="number"
                  name="interval"
                  value={form.interval}
                  onChange={handleChange}
                  min={10}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-600">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Monitor"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
