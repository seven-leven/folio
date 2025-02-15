// src/Routes.tsx
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Architecture from "./pages/Architecture.tsx";
import CodingProjects from "./pages/CodingProjects.tsx";
import Miscellaneous from "./pages/Miscellaneous.tsx";
import NotFound from "./pages/NotFound.tsx";
import SphereAnimationPage from "./pages/SphereAnimation.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/coding" element={<CodingProjects />} />
      <Route path="/misc" element={<Miscellaneous />} />
      <Route path="/coding/sphere" element={<SphereAnimationPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
