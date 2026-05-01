import { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import './Recommendations.css';

export default function Recommendations() {
    const [result, setResult] = useState(null);
    const [nextResult, setNextResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nextLoading, setNextLoading] = useState(false);
    const [error, setError] = useState('');
    const [nextError, setNextError] = useState('');

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

    const fetchNext = async () => {
        setNextLoading(true);
        setNextError('');
        setNextResult(null);
        try {
            const res = await api.get('/recommendations/next');
            setNextResult(res.data);
        } catch (err) {
            setNextError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setNextLoading(false);
        }
    };

    const parseRecommendations = (text) => {
        const blocks = text.split(/\n(?=\d+\.)/).filter(Boolean);
        return blocks.map(block => block.trim());
    };

    return (
        <>
            <Navbar />
            <div className="rec-page">
                <main className="rec-main">
                    <div className="rec-hero">
                        <h1>For You</h1>
                        <p>AI-powered picks based on your taste</p>
                    </div>

                    {/* Section 1 - General recommendations */}
                    <div className="rec-section">
                        <h2 className="rec-section-title">Discover something new</h2>
                        <p className="rec-section-sub">AI suggests 3 films or books you'd love based on your ratings</p>

                        {!result && !loading && (
                            <div className="rec-prompt">
                                <div className="rec-graphic">🤖</div>
                                <p>I'll study your shelf and find films and books you'd love.</p>
                                <p className="rec-note">Rate at least one item 4 stars or higher first!</p>
                                <button className="rec-btn" onClick={fetchRecommendations}>
                                    Generate recommendations
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
                                    Regenerate
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="rec-divider" />

                    {/* Section 2 - What to watch/read next */}
                    <div className="rec-section">
                        <h2 className="rec-section-title">What to watch or read next?</h2>
                        <p className="rec-section-sub">AI picks the best match from your planning list based on your taste</p>

                        {!nextResult && !nextLoading && (
                            <div className="rec-prompt next-prompt">
                                <div className="rec-graphic">📋</div>
                                <p>I'll look at your planning list and tell you what to tackle next.</p>
                                <p className="rec-note">You need items with Plan to watch or Plan to read status!</p>
                                <button className="rec-btn next-btn" onClick={fetchNext}>
                                    Pick something for me
                                </button>
                            </div>
                        )}

                        {nextLoading && (
                            <div className="rec-loading">
                                <div className="loading-spinner">📋</div>
                                <p>Scanning your planning list...</p>
                                <p className="rec-note">This may take a few seconds</p>
                            </div>
                        )}

                        {nextError && (
                            <div className="rec-error-box">
                                <p>{nextError}</p>
                                <button className="rec-btn secondary" onClick={fetchNext}>Try again</button>
                            </div>
                        )}

                        {nextResult && (
                            <div className="rec-results">
                                <div className="based-on">
                                    <span>Your planning list: </span>
                                    {nextResult.plan_list.map((title, i) => (
                                        <span key={i} className="based-tag">{title}</span>
                                    ))}
                                </div>
                                <div className="next-pick-card">
                                    <div className="next-pick-label">Watch or read next</div>
                                    <p className="rec-text">{nextResult.pick}</p>
                                </div>
                                <button className="rec-btn secondary" onClick={fetchNext}>
                                    Ask again
                                </button>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}
