import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('username', form.username);
            params.append('password', form.password);

            const res = await api.post('/auth/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('token', res.data.access_token);
            navigate('/shelf');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-deco deco-1">📚</div>
            <div className="auth-deco deco-2">🎬</div>
            <div className="auth-deco deco-3">⭐</div>
            <div className="auth-deco deco-4">🍿</div>

            <div className="auth-card">
                <div className="auth-logo">shelf</div>
                <p className="auth-tagline">your personal film & book universe</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="your username"
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="your password"
                            required
                        />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in →'}
                    </button>
                </form>

                <p className="auth-switch">
                    No account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}
