import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, NavLink } from "react-router-dom";
import "./index.css";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Loans } from "./pages/Loans";
import { Shoots } from "./pages/Shoots";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="py-6 pr-4 flex gap-6">
        {/* Sidebar (fixed) */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 fixed left-4 top-6 h-[calc(100vh-3rem)] rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-sm z-20">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <span className="text-xl">📦</span>
            <span className="font-semibold">Polypore</span>
          </div>
          <nav className="mt-2 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
              end
            >
              <span className="mr-2">📊</span> Overview
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              <span className="mr-2">📦</span> Stock
            </NavLink>
            <NavLink
              to="/loans"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              <span className="mr-2">🔗</span> Bookings
            </NavLink>
            <NavLink
              to="/shoots"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`
              }
            >
              <span className="mr-2">🎬</span> Shoots
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/shoots" element={<Shoots />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-3 py-2 shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-sm ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-neutral-700 dark:text-neutral-300"
            }`
          }
          end
        >
          📊
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-sm ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          📦
        </NavLink>
        <NavLink
          to="/loans"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-sm ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          🔗
        </NavLink>
        <NavLink
          to="/shoots"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-xl text-sm ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-neutral-700 dark:text-neutral-300"
            }`
          }
        >
          🎬
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
