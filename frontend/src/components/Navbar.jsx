import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Hide navbar content on auth pages
  const hideUserInfo =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/admin/signup";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (hideUserInfo || !user) {
    return (
      <nav className="w-full border-b border-zinc-800 bg-black px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-extrabold text-[#7A1CAC]"
        >
          GRIEThub
        </Link>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-zinc-800 bg-black">
      <div className="px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/events"
          className="text-2xl font-extrabold text-[#7A1CAC]"
        >
          GRIEThub
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <div className="hidden md:flex items-center gap-6">

          {/* EVENTS → STUDENT + ADMIN */}
          {user.role !== "superadmin" && (
            <Link
              to="/events"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Events
            </Link>
          )}

          {/* MY REGISTRATIONS → STUDENT + ADMIN */}
          {(user.role === "student" || user.role === "admin") && (
            <Link
              to="/my-registrations"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              My Registrations
            </Link>
          )}

          {/* MANAGE EVENTS → ADMIN ONLY */}
          {user.role === "admin" && (
            <Link
              to="/manage-events"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Manage Events
            </Link>
          )}

          {/* SUPERADMIN DASHBOARD */}
          {user.role === "superadmin" && (
            <Link
              to="/superadmin/dashboard"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Dashboard
            </Link>
          )}

          {/* USER NAME */}
          <span className="text-zinc-300 text-sm">
            Hi,{" "}
            <span className="font-semibold text-white">
              {user.name}
            </span>
          </span>

          {/* ROLE BADGE */}
          {user.role !== "student" && (
            <span
              className={`px-3 py-1 text-xs rounded-full font-semibold
              ${
                user.role === "superadmin"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-[#7A1CAC]/20 text-[#7A1CAC]"
              }`}
            >
              {user.role.toUpperCase()}
            </span>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            Logout
          </button>
        </div>

        {/* ================= MOBILE TOGGLE ================= */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-zinc-300 text-2xl"
        >
          ☰
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-4 border-t border-zinc-800">

          {/* EVENTS */}
          {user.role !== "superadmin" && (
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Events
            </Link>
          )}

          {/* MY REGISTRATIONS */}
          {(user.role === "student" || user.role === "admin") && (
            <Link
              to="/my-registrations"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              My Registrations
            </Link>
          )}

          {/* MANAGE EVENTS */}
          {user.role === "admin" && (
            <Link
              to="/manage-events"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Manage Events
            </Link>
          )}

          {/* SUPERADMIN DASHBOARD */}
          {user.role === "superadmin" && (
            <Link
              to="/superadmin/dashboard"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Dashboard
            </Link>
          )}

          {/* USER INFO */}
          <div className="text-zinc-300 text-sm">
            Hi,{" "}
            <span className="font-semibold text-white">
              {user.name}
            </span>
          </div>

          {/* ROLE BADGE */}
          {user.role !== "student" && (
            <span
              className={`inline-block px-3 py-1 text-xs rounded-full font-semibold
              ${
                user.role === "superadmin"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-[#7A1CAC]/20 text-[#7A1CAC]"
              }`}
            >
              {user.role.toUpperCase()}
            </span>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
