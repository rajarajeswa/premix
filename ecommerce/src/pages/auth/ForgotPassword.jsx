import { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { apiFetch } from '../../api/client';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!email) {
            setError('Email is required');
            return;
        }
        
        setLoading(true);
        try {
            const { data } = await apiFetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });
            
            if (data.success) {
                setSuccess(data.message || 'If an account with that email exists, a reset link has been sent.');
                setEmail('');
            } else {
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            setError(err.message || 'Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--athangudi-cream)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="chettinad-card p-5">
                            <div className="text-center mb-4">
                                <div className="d-inline-block mb-2" style={{ width: '60px', height: '3px', backgroundColor: 'var(--chettinad-terracotta)' }} />
                                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Forgot Password</h2>
                                <p className="text-muted">Enter your email to receive a password reset link</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        placeholder="your@email.com" 
                                    />
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <button type="submit" className="btn btn-chettinad-primary w-100 mb-3" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <p className="text-center text-muted mb-0">
                                    Remember your password? <Link to="/login" style={{ color: 'var(--chettinad-terracotta)', fontWeight: 600 }}>Login</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;