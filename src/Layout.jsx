import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          Home
        </NavLink>
        {" | "}
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          About
        </NavLink>
      </nav>
      <hr />
      <main>
        {/* Child routes will render here */}
        <Outlet />
      </main>
    </div>
  );
}
