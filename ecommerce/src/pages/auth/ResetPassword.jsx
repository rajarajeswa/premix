import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import { apiFetch } from '../../api/client';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!password || !confirmPassword) {
            setError('Both password fields are required');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            const { data } = await apiFetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            if (data.success) {
                setSuccess(data.message || 'Password has been reset successfully');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
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
                                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--chettinad-maroon)', fontWeight: 600 }}>Reset Password</h2>
                                <p className="text-muted">Enter your new password</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">New Password (min 6 characters)</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        minLength={6}
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                        minLength={6}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <button type="submit" className="btn btn-chettinad-primary w-100 mb-3" disabled={loading}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;