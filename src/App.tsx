//App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRoutes from './Routes';

function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
    </Router>
  );
}

export default App;