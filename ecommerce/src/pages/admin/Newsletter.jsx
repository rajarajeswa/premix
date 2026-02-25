import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';

function Newsletter() {
    const { token } = useAuth();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [stats, setStats] = useState(null);
    const [subscribers, setSubscribers] = useState([]);
    const [activeTab, setActiveTab] = useState('compose');

    useEffect(() => {
        fetchStats();
        fetchSubscribers();
    }, [token]);

    const fetchStats = async () => {
        try {
            const { data } = await apiFetch('/api/newsletter/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const { data } = await apiFetch('/api/subscribers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (data.success) {
                setSubscribers(data.subscribers);
            }
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        
        if (!subject.trim() || !content.trim()) {
            setStatus({ type: 'error', message: 'Subject and content are required' });
            return;
        }

        setSending(true);
        setStatus({ type: '', message: '' });

        try {
            const { data } = await apiFetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    subject: subject.trim(),
                    content: content.trim(),
                    htmlContent: htmlContent.trim() || undefined
                })
            });

            if (data.success) {
                setStatus({ 
                    type: 'success', 
                    message: `Newsletter sent successfully to ${data.recipientCount} subscribers!` 
                });
                setSubject('');
                setContent('');
                setHtmlContent('');
            } else {
                setStatus({ type: 'error', message: data.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to send newsletter' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-vh-100 py-4" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--earth-cream)' }}>
            <div className="container">
                <div className="text-center mb-4">
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-maroon)' }}>
                        📬 Newsletter Management
                    </h2>
                    <p className="text-muted">Send newsletters to your subscribers</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card-chettinad p-3 text-center">
                                <h3 style={{ color: 'var(--primary-maroon)', margin: 0 }}>{stats.total}</h3>
                                <small className="text-muted">Total Subscribers</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card-chettinad p-3 text-center">
                                <h3 style={{ color: 'var(--athangudi-teal)', margin: 0 }}>{stats.active}</h3>
                                <small className="text-muted">Active</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card-chettinad p-3 text-center">
                                <h3 style={{ color: 'var(--spice-corriander)', margin: 0 }}>{stats.recentSignups}</h3>
                                <small className="text-muted">Last 7 Days</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card-chettinad p-3 text-center">
                                <h3 style={{ color: 'var(--neutral-warm-gray)', margin: 0 }}>{stats.unsubscribed}</h3>
                                <small className="text-muted">Unsubscribed</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'compose' ? 'active' : ''}`}
                            onClick={() => setActiveTab('compose')}
                            style={{ color: activeTab === 'compose' ? 'var(--primary-maroon)' : 'inherit' }}
                        >
                            ✉️ Compose Newsletter
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'subscribers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('subscribers')}
                            style={{ color: activeTab === 'subscribers' ? 'var(--primary-maroon)' : 'inherit' }}
                        >
                            👥 Subscribers ({subscribers.length})
                        </button>
                    </li>
                </ul>

                {status.message && (
                    <div 
                        className={`alert alert-${status.type === 'success' ? 'success' : 'danger'} mb-4`}
                        style={{ 
                            backgroundColor: status.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            borderColor: status.type === 'success' ? '#4CAF50' : '#f44336',
                            color: status.type === 'success' ? '#2E7D32' : '#C62828'
                        }}
                    >
                        {status.message}
                    </div>
                )}

                {activeTab === 'compose' && (
                    <div className="card-chettinad p-4">
                        <form onSubmit={handleSendNewsletter}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Subject *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter newsletter subject..."
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Plain Text Content *</label>
                                <textarea
                                    className="form-control"
                                    rows="6"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter your newsletter content..."
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">HTML Content (Optional)</label>
                                <textarea
                                    className="form-control"
                                    rows="6"
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    placeholder="<h2>Your heading</h2><p>Your content...</p>"
                                />
                                <small className="text-muted">
                                    If provided, this will be used for the email body. Otherwise, plain text will be used.
                                </small>
                            </div>

                            <div className="d-flex gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary-chettinad"
                                    disabled={sending || !stats?.active}
                                >
                                    {sending ? 'Sending...' : `Send to ${stats?.active || 0} Subscribers`}
                                </button>
                                {stats?.active === 0 && (
                                    <span className="text-muted align-self-center">
                                        No active subscribers to send to
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'subscribers' && (
                    <div className="card-chettinad p-4">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Subscribed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted py-4">
                                                No subscribers yet
                                            </td>
                                        </tr>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <tr key={sub.id}>
                                                <td>{sub.email}</td>
                                                <td>
                                                    <span 
                                                        className={`badge ${sub.isActive ? 'bg-success' : 'bg-secondary'}`}
                                                        style={{ 
                                                            backgroundColor: sub.isActive 
                                                                ? 'var(--athangudi-teal)' 
                                                                : 'var(--neutral-warm-gray)'
                                                        }}
                                                    >
                                                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                                                    </span>
                                                </td>
                                                <td>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Newsletter;
