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
      <Route path="/folio" element={<Home />} />
      <Route path="/folio/architecture" element={<Architecture />} />
      <Route path="/folio/coding" element={<CodingProjects />} />
      <Route path="/folio/misc" element={<Miscellaneous />} />
      <Route path="/folio/coding/sphere" element={<SphereAnimationPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;