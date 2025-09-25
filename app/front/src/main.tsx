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
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <div className="font-semibold">📦 Polypore</div>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-600" : "text-neutral-600"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                isActive ? "text-blue-600" : "text-neutral-600"
              }
            >
              Inventory
            </NavLink>
            <NavLink
              to="/loans"
              className={({ isActive }) =>
                isActive ? "text-blue-600" : "text-neutral-600"
              }
            >
              Loans
            </NavLink>
            <NavLink
              to="/shoots"
              className={({ isActive }) =>
                isActive ? "text-blue-600" : "text-neutral-600"
              }
            >
              Shoots
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/shoots" element={<Shoots />} />
        </Routes>
      </main>
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
