import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, NavLink } from "react-router-dom";
import "./index.css";
import { Stock } from "./pages/Stock";
import { Bookings } from "./pages/Bookings";
import { Shoots } from "./pages/Shoots";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="py-6 pr-4 flex gap-6">
        {/* Sidebar (fixed) */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 fixed left-4 top-6 h-[calc(100vh-3rem)] rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-sm z-20">
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <img src="/logo.png" alt="Polypore logo" className="h-10 w-10" />
            <span className="font-semibold text-lg">Polypore</span>
          </div>
          <nav className="mt-2 space-y-1">
            <NavLink
              to="/stock"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors font-medium ${isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              Stock
            </NavLink>
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors font-medium ${isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              Bookings
            </NavLink>
            <NavLink
              to="/shoots"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors font-medium ${isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              Shoots
            </NavLink>
          </nav>
          <div className="mt-auto pt-3 border-t border-neutral-200/70 dark:border-neutral-800 text-xs text-neutral-500">
            <div className="px-2">v0.1.0</div>
          </div>
        </aside>

        {/* Spacer to account for fixed sidebar width */}
        <div className="hidden md:block w-60 shrink-0" />

        {/* Main content */}
        <main className="flex-1 space-y-6 min-w-0">
          <Routes>
            <Route path="/" element={<Stock />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/shoots" element={<Shoots />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-2 py-2 shadow-lg">
        <NavLink
          to="/stock"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl text-xs font-medium transition-colors ${isActive
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
              : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          Stock
        </NavLink>
        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl text-xs font-medium transition-colors ${isActive
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
              : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          Bookings
        </NavLink>
        <NavLink
          to="/shoots"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl text-xs font-medium transition-colors ${isActive
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
              : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          Shoots
        </NavLink>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
