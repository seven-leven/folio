import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { handleImgError } from "../../utils/imageUtils.ts";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: "./", name: "Home" },
    { path: "./architecture", name: "Architecture" },
    { path: "./coding", name: "Coding" },
    { path: "./misc", name: "Misc" },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <NavLink to="./" className={styles.logo}>
          <img
            src="./assets/logo.png"
            alt="Logo"
            className={styles.logoImage}
            onError={handleImgError}
          />
          <span className={styles.logoText}>Folio</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className={styles.desktopLinks}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          type="button"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={`${styles.mobileLinks} ${isMenuOpen ? styles.open : ""}`}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
