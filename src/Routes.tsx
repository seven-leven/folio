//src/Routes.tsx 
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Architecture from './pages/Architecture';
import CodingProjects from './pages/CodingProjects';
import Miscellaneous from './pages/Miscellaneous';
import NotFound from './pages/NotFound';
import SphereAnimationPage from './pages/SphereAnimation';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/coding" element={<CodingProjects />} />
      <Route path="/misc" element={<Miscellaneous />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/coding/sphere" element={<SphereAnimationPage />} />
    </Routes>
  );
};

export default AppRoutes;