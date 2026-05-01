import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import './AddItem.css';

const FILM_STATUSES = [
    { value: 'watched', label: 'Watched' },
    { value: 'plan_to_watch', label: 'Plan to watch' },
];

const BOOK_STATUSES = [
    { value: 'read', label: 'Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'plan_to_read', label: 'Plan to read' },
];

export default function AddItem() {
    const [form, setForm] = useState({
        title: '',
        type: 'film',
        genre: '',
        rating: '',
        notes: '',
        status: 'watched',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimer = useRef(null);
    const navigate = useNavigate();

    const statuses = form.type === 'film' ? FILM_STATUSES : BOOK_STATUSES;

    useEffect(() => {
        if (form.title.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const endpoint = form.type === 'film' ? '/search/films' : '/search/books';
                const res = await api.get(`${endpoint}?q=${encodeURIComponent(form.title)}`);
                setSuggestions(res.data);
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(searchTimer.current);
    }, [form.title, form.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setForm(f => ({
                ...f,
                type: value,
                status: value === 'film' ? 'watched' : 'read',
                title: '',
                genre: '',
            }));
            setSuggestions([]);
            return;
        }
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSelectSuggestion = (suggestion) => {
        setForm(f => ({
            ...f,
            title: suggestion.title,
            genre: suggestion.genre || f.genre,
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleRating = (value) => {
        setForm(f => ({ ...f, rating: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                rating: form.rating ? parseFloat(form.rating) : null,
            };
            await api.post('/items/', payload);
            navigate('/shelf');
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="add-container">
                <div className="add-card">
                    <button className="back-btn" onClick={() => navigate('/shelf')}>Back</button>
                    <h1 className="add-title">Add to shelf</h1>
                    <p className="add-sub">What have you been watching or reading?</p>

                    <form onSubmit={handleSubmit} className="add-form">

                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${form.type === 'film' ? 'active' : ''}`}
                                onClick={() => handleChange({ target: { name: 'type', value: 'film' } })}
                            >
                                Film
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${form.type === 'book' ? 'active' : ''}`}
                                onClick={() => handleChange({ target: { name: 'type', value: 'book' } })}
                            >
                                Book
                            </button>
                        </div>

                        <div className="field search-field">
                            <label>Title *</label>
                            <div className="search-wrapper">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder={form.type === 'film' ? 'Search for a film...' : 'Search for a book...'}
                                    required
                                    autoComplete="off"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                />
                                {searchLoading && <div className="search-spinner">searching...</div>}

                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="suggestions-dropdown">
                                        {suggestions.map((s, i) => (
                                            <div
                                                key={i}
                                                className="suggestion-item"
                                                onMouseDown={() => handleSelectSuggestion(s)}
                                            >
                                                {(s.poster || s.cover) && (
                                                    <img
                                                        src={s.poster || s.cover}
                                                        alt={s.title}
                                                        className="suggestion-img"
                                                    />
                                                )}
                                                <div className="suggestion-info">
                                                    <span className="suggestion-title">{s.title}</span>
                                                    <span className="suggestion-meta">
                                                        {s.year && `${s.year}`}
                                                        {s.author && ` · ${s.author}`}
                                                        {s.genre && ` · ${s.genre}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="field">
                            <label>Genre {form.genre && <span className="auto-filled">auto-filled</span>}</label>
                            <input
                                name="genre"
                                value={form.genre}
                                onChange={handleChange}
                                placeholder="e.g. sci-fi, fantasy, thriller..."
                            />
                        </div>

                        <div className="field">
                            <label>Status</label>
                            <div className="status-toggle">
                                {statuses.map(s => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        className={`toggle-btn ${form.status === s.value ? 'active' : ''}`}
                                        onClick={() => setForm(f => ({
                                            ...f,
                                            status: s.value,
                                            rating: s.value === 'plan_to_watch' || s.value === 'plan_to_read' ? '' : f.rating
                                        }))}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.status !== 'plan_to_watch' && form.status !== 'plan_to_read' && (
                        <div className="field">
                            <label>Rating</label>
                            <div className="star-picker">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span
                                        key={i}
                                        className={`pick-star ${i <= (hoverRating || form.rating) ? 'active' : ''}`}
                                        onClick={() => handleRating(i)}
                                        onMouseEnter={() => setHoverRating(i)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </span>
                                ))}
                                {form.rating && (
                                    <span
                                        className="clear-rating"
                                        onClick={() => setForm(f => ({ ...f, rating: '' }))}
                                    >
                                        clear
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                        <div className="field">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Any thoughts, quotes, or feelings..."
                                rows={3}
                            />
                        </div>

                        {error && <p className="add-error">{error}</p>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Adding...' : 'Add to shelf'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
