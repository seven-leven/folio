import Navbar from './components/common/Navbar';
import AppRoutes from './Routes';
import { BrowserRouter } from 'react-router-dom';

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
