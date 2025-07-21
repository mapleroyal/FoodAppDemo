# Directory Structure
```
src/
  pages/
    About.jsx
    Home.jsx
  App.jsx
  index.css
  Layout.jsx
  main.jsx
index.html
package.json
vite.config.js
```

# Files

## File: src/pages/About.jsx
```javascript
export default function About() {
  return (
    <>
      <h2>About Page</h2>
      <p>This is the about page.</p>
    </>
  );
}
```

## File: src/pages/Home.jsx
```javascript
import Button from "@mui/material/Button";

export default function Home() {
  return (
    <>
      <h2>Home Page</h2>
      <Button variant="contained">Hello from Material-UI!</Button>
      <p className="text-sky-600">Tailwind is working!</p>
    </>
  );
}
```

## File: src/Layout.jsx
```javascript
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
```

## File: vite.config.js
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## File: src/index.css
```css
@import "tailwindcss";

@import "@fontsource/roboto/300.css";
@import "@fontsource/roboto/400.css";
@import "@fontsource/roboto/500.css";
@import "@fontsource/roboto/700.css";
```

## File: src/main.jsx
```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <App />
      </StyledEngineProvider>
    </BrowserRouter>
  </StrictMode>
);
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- favicon goes here; this example uses ./public/vite.svg -->
    <!-- <link rel="icon" type="image/svg+xml" href="/vite.svg" /> -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Name</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## File: package.json
```json
{
  "name": "vite-react-js-tailwind-mui-reactrouter-scaffolding",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@fontsource/roboto": "^5.2.6",
    "@mui/icons-material": "^7.2.0",
    "@mui/material": "^7.2.0",
    "@tailwindcss/vite": "^4.1.11",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router": "^7.7.0",
    "tailwindcss": "^4.1.11"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.30.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "vite": "^7.0.4"
  }
}
```

## File: src/App.jsx
```javascript
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
```
