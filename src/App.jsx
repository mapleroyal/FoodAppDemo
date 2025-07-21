import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        {/* You can add more routes here */}
      </Route>
    </Routes>
  );
}
