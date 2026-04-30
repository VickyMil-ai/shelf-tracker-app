import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/shelf')}>
                shelf
            </div>

            <nav className="navbar-links">
                <button
                    className={`nav-link ${isActive('/shelf') ? 'active' : ''}`}
                    onClick={() => navigate('/shelf')}
                >
                    My Shelf
                </button>
                <button
                    className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
                    onClick={() => navigate('/recommendations')}
                >
                    For You
                </button>
            </nav>

            <div className="navbar-actions">
                <button className="nav-btn primary" onClick={() => navigate('/add')}>
                    + Add item
                </button>
                <button className="nav-btn logout" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </header>
    );
}
