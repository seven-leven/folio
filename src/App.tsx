import Navbar from './components/common/Navbar';
import AppRoutes from './Routes';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <>
    <BrowserRouter basename="/folio">
    <Navbar />
      <div className="content">
        <AppRoutes />
      </div>
    </BrowserRouter>

    </>
  );
}

export default App;
