import Navbar from "./components/common/Navbar.tsx";
import AppRoutes from "./Routes.tsx";
import React from "react";

function App() {
  return (
    <>
      <Navbar />
      <div className="content">
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
