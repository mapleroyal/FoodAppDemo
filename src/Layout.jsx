import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <main>
        {/* Child routes will render here */}
        <Outlet />
      </main>
    </>
  );
}
