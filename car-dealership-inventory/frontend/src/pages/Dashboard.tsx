import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number | string;
  quantity: number;
}

interface VehicleForm {
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: string;
}

const emptyForm: VehicleForm = {
  make: "",
  model: "",
  category: "Sedan",
  price: "",
  quantity: "",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Admin modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Restock modal state
  const [restockVehicle, setRestockVehicle] = useState<Vehicle | null>(null);
  const [restockQty, setRestockQty] = useState("1");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "ADMIN";

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3500);
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vehicles", {
        params: {
          make: search || undefined,
          category: category || undefined,
        },
      });
      const data = response.data;
      setVehicles(data.vehicles || data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const purchase = async (id: number) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      notify("Vehicle purchased successfully!");
      fetchVehicles();
    } catch (error: any) {
      notify(error.response?.data?.message || "Purchase failed", "error");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchVehicles();
  };

  // Admin: open create modal
  const openCreate = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  // Admin: open edit modal
  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({
      make: v.make,
      model: v.model,
      category: v.category,
      price: String(v.price),
      quantity: String(v.quantity),
    });
    setFormError("");
    setShowModal(true);
  };

  // Admin: submit create or edit
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const payload = {
      make: form.make,
      model: form.model,
      category: form.category,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
        notify("Vehicle updated successfully!");
      } else {
        await api.post("/vehicles", payload);
        notify("Vehicle created successfully!");
      }
      setShowModal(false);
      fetchVehicles();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Admin: delete vehicle
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      notify("Vehicle deleted.");
      fetchVehicles();
    } catch (error: any) {
      notify(error.response?.data?.message || "Delete failed", "error");
    }
  };

  // Admin: restock
  const handleRestock = async () => {
    if (!restockVehicle) return;
    try {
      await api.post(`/vehicles/${restockVehicle.id}/restock`, {
        quantity: Number(restockQty),
      });
      notify(`Restocked ${restockQty} unit(s).`);
      setRestockVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      notify(error.response?.data?.message || "Restock failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">CarDeal</h1>
            <p className="text-slate-400 text-sm">Vehicle Inventory System</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">{user.name}</span>
            {isAdmin && (
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                ADMIN
              </span>
            )}
            <button
              onClick={logout}
              className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {isAdmin ? "Manage Inventory" : "Available Vehicles"}
            </h2>
            <p className="text-slate-500 mt-1">
              {isAdmin
                ? "Create, update, delete and restock vehicles."
                : "Browse and purchase vehicles from our inventory."}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
            >
              + Add Vehicle
            </button>
          )}
        </div>

        {/* Notification */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Search / Filter */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-5 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make..."
            className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">All Categories</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Truck">Truck</option>
            <option value="Luxury">Luxury</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            Search
          </button>
        </form>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-xl text-slate-500">No vehicles found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-6 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-blue-600 font-semibold">
                      {vehicle.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      vehicle.quantity > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vehicle.quantity > 0 ? `${vehicle.quantity} in stock` : "Out of stock"}
                  </span>
                </div>

                <p className="text-3xl font-bold text-slate-900 mt-4">
                  ₹{Number(vehicle.price).toLocaleString()}
                </p>

                <div className="mt-auto pt-5 flex flex-col gap-2">
                  {!isAdmin && (
                    <button
                      disabled={vehicle.quantity === 0}
                      onClick={() => purchase(vehicle.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold"
                    >
                      {vehicle.quantity === 0 ? "Out of Stock" : "Purchase"}
                    </button>
                  )}

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(vehicle)}
                        className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setRestockVehicle(vehicle);
                          setRestockQty("1");
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>

            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {(["make", "model"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5"
                >
                  {["Sedan", "SUV", "Hatchback", "Truck", "Luxury"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingVehicle ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Restock Vehicle</h2>
            <p className="text-slate-500 mb-6">
              {restockVehicle.make} {restockVehicle.model} — currently{" "}
              <strong>{restockVehicle.quantity}</strong> in stock
            </p>
            <label className="block text-sm font-medium mb-1">Add Quantity</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRestockVehicle(null)}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold"
              >
                Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
