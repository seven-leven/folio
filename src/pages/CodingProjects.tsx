//src/pages/Codingprojects.tsx
import { Link } from 'react-router-dom';

export default function codingprojects() {
  return (
    <main>
      <h1>codingprojects</h1>
      <Link to="/coding/sphere">
        <h3>Terminal Sphere Animation</h3>
        <p>ASCII art sphere with dynamic lighting</p>
      </Link>
      <Link to="https://seven-leven.github.io/bird_dash/">
        <h3>Bird tracking dashboard</h3>
      </Link>
    </main>
  );
}