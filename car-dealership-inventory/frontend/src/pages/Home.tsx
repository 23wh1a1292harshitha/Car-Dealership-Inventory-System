import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          Car<span className="text-blue-500">Deal</span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg">
          Vehicle Inventory Management System
        </p>
      </div>

      {/* Role Cards */}
      <p className="text-slate-300 text-lg mb-8 font-medium">
        Who are you?
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {/* Admin Card */}
        <button
          onClick={() => navigate("/login?role=admin")}
          className="flex-1 group bg-blue-600 hover:bg-blue-500 transition-all duration-200 rounded-2xl p-8 text-left shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1"
        >
          <div className="text-4xl mb-4">🛠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Manage inventory — add, update, delete, and restock vehicles. Full control over the dealership.
          </p>
          <div className="mt-6 flex items-center text-white font-semibold text-sm">
            Enter as Admin
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Customer Card */}
        <button
          onClick={() => navigate("/login?role=customer")}
          className="flex-1 group bg-white hover:bg-slate-50 transition-all duration-200 rounded-2xl p-8 text-left shadow-xl hover:-translate-y-1"
        >
          <div className="text-4xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Browse available vehicles, search by category, and purchase your favourite car.
          </p>
          <div className="mt-6 flex items-center text-slate-900 font-semibold text-sm">
            Browse Vehicles
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <p className="text-slate-600 text-sm mt-12">
        © 2026 CarDeal Inventory System
      </p>
    </div>
  );
}
