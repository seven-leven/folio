import Navbar from "./components/common/Navbar.tsx";
import AppRoutes from "./Routes.tsx";
import styles from "./App.module.css";

function App() {
  return (
    <>
      <Navbar />
      <div className={styles.content}>
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
