import Navbar from './components/common/Navbar';
import AppRoutes from './Routes';

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
