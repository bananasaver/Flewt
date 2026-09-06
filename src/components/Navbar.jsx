import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link to="/" className="nav-logo">
          Flewt<span className="nav-logo-dash">.</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/tools" className="nav-link">Tools</NavLink>
          <NavLink to="/pricing" className="nav-link">Pricing</NavLink>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">{user.email}</Link>
              <button
                className="btn btn-outline nav-btn"
                onClick={() => { logout(); navigate('/'); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/signup" className="btn btn-flash nav-btn">Sign up free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
