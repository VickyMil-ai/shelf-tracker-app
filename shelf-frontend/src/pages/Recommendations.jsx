import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Recommendations.css';
import Navbar from '../components/Navbar';

export default function Recommendations() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await api.get('/recommendations/');
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const parseRecommendations = (text) => {
        // Split by numbered lines like "1.", "2.", "3."
        const blocks = text.split(/\n(?=\d+\.)/).filter(Boolean);
        return blocks.map(block => block.trim());
    };

    return (
        <div className="rec-page">
            <Navbar />

            <main className="rec-main">
                <div className="rec-hero">
                    <h1>For You ✨</h1>
                    <p>AI-powered picks based on your taste</p>
                </div>

                {!result && !loading && (
                    <div className="rec-prompt">
                        <div className="rec-graphic">🤖</div>
                        <p>I'll study your shelf and find films & books you'd love.</p>
                        <p className="rec-note">Make sure you've rated at least one item 4 stars or higher!</p>
                        <button className="rec-btn" onClick={fetchRecommendations}>
                            Generate recommendations →
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="rec-loading">
                        <div className="loading-spinner">✨</div>
                        <p>Studying your taste...</p>
                        <p className="rec-note">This may take a few seconds</p>
                    </div>
                )}

                {error && (
                    <div className="rec-error-box">
                        <p>{error}</p>
                        <button className="rec-btn secondary" onClick={fetchRecommendations}>Try again</button>
                    </div>
                )}

                {result && (
                    <div className="rec-results">
                        <div className="based-on">
                            <span>Based on: </span>
                            {result.based_on.map((title, i) => (
                                <span key={i} className="based-tag">{title}</span>
                            ))}
                        </div>

                        <div className="rec-cards">
                            {parseRecommendations(result.recommendations).map((block, i) => (
                                <div key={i} className="rec-card">
                                    <div className="rec-number">{i + 1}</div>
                                    <p className="rec-text">{block.replace(/^\d+\.\s*/, '')}</p>
                                </div>
                            ))}
                        </div>

                        <button className="rec-btn secondary" onClick={fetchRecommendations}>
                            🔄 Regenerate
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
