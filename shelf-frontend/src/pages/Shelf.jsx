import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Shelf.css';
import Navbar from '../components/Navbar';

const TYPE_EMOJI = { film: '🎬', book: '📚' };
const STATUS_LABEL = {
    watched: 'Watched',
    plan_to_watch: 'Plan to watch',
    read: 'Read',
    reading: 'Reading',
    plan_to_read: 'Plan to read'
};

function Stars({ rating }) {
    if (!rating) return <span className="no-rating">Not rated</span>;
    return (
        <span className="stars">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
            ))}
        </span>
    );
}

function ItemCard({ item, onDelete, onEdit }) {
    return (
        <div className={`item-card type-${item.type}`}>
            <div className="card-type">{TYPE_EMOJI[item.type]} {item.type}</div>
            <h3 className="card-title">{item.title}</h3>
            {item.genre && <span className="card-genre">{item.genre}</span>}
            <Stars rating={item.rating} />
            <div className="card-status">{STATUS_LABEL[item.status]}</div>
            {item.notes && <p className="card-notes">"{item.notes}"</p>}
            <div className="card-actions">
                <button className="edit-btn" onClick={() => onEdit(item)}>✏️</button>
                <button className="delete-btn" onClick={() => onDelete(item.id)}>✕</button>
            </div>
        </div>
    );
}

export default function Shelf() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    // const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // const fetchUser = async () => {
    //     try {
    //         const res = await api.get('/auth/me');
    //         setUsername(res.data.username);
    //     } catch {}
    // };

    const fetchItems = useCallback(async () => {
        try {
            const res = await api.get('/items/');
            setItems(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this from your shelf?')) return;
        await api.delete(`/items/${id}`);
        setItems(items.filter(i => i.id !== id));
    };

    const handleEdit = (item) => {
        navigate('/edit', { state: { item } });
    };

    // const handleLogout = () => {
    //     localStorage.removeItem('token');
    //     navigate('/login');
    // };

    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

    return (
        <div className="shelf-page">
            <Navbar />

            <main className="shelf-main">
                <div className="shelf-hero">
                    <h1>Your Shelf</h1>
                    <p>{items.length} {items.length === 1 ? 'item' : 'items'} collected</p>
                </div>

                <div className="filter-bar">
                    {['all', 'film', 'book'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? '🌟 All' : f === 'film' ? '🎬 Films' : '📚 Books'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="shelf-empty">Loading your shelf...</div>
                ) : filtered.length === 0 ? (
                    <div className="shelf-empty">
                        <p>Nothing here yet!</p>
                        <button onClick={() => navigate('/add')} className="nav-btn primary">Add your first item</button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {filtered.map(item => (
                            <ItemCard key={item.id} item={item} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
