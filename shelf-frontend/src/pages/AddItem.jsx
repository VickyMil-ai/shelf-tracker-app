import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
    const navigate = useNavigate();

    const statuses = form.type === 'film' ? FILM_STATUSES : BOOK_STATUSES;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // When type changes, reset status to the correct default
        if (name === 'type') {
            setForm(f => ({
                ...f,
                type: value,
                status: value === 'film' ? 'watched' : 'read',
            }));
            return;
        }

        setForm(f => ({ ...f, [name]: value }));
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
        <div className="add-container">
            <div className="add-deco deco-1">✨</div>
            <div className="add-deco deco-2">🎭</div>

            <div className="add-card">
                <button className="back-btn" onClick={() => navigate('/shelf')}>← Back</button>
                <h1 className="add-title">Add to shelf</h1>
                <p className="add-sub">What have you been watching or reading?</p>

                <form onSubmit={handleSubmit} className="add-form">

                    {/* Type toggle */}
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${form.type === 'film' ? 'active' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'film' } })}
                        >
                            🎬 Film
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${form.type === 'book' ? 'active' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'book' } })}
                        >
                            📚 Book
                        </button>
                    </div>

                    {/* Title */}
                    <div className="field">
                        <label>Title *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder={form.type === 'film' ? 'e.g. Dune' : 'e.g. The Name of the Wind'}
                            required
                        />
                    </div>

                    {/* Genre */}
                    <div className="field">
                        <label>Genre</label>
                        <input
                            name="genre"
                            value={form.genre}
                            onChange={handleChange}
                            placeholder="e.g. sci-fi, fantasy, thriller..."
                        />
                    </div>

                    {/* Status */}
                    <div className="field">
                        <label>Status</label>
                        <div className="status-toggle">
                            {statuses.map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={`toggle-btn ${form.status === s.value ? 'active' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, status: s.value }))}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Star rating */}
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

                    {/* Notes */}
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
                        {loading ? 'Adding...' : 'Add to shelf →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
