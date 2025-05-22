import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthStyles.css'; // File CSS terpisah untuk animasi

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/');
    // Trigger animation after component mounts
    setAnimate(true);
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://45.64.100.26:88/perpus-api/public/api/login',
        form,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        setError('Token tidak ditemukan. Pastikan API berfungsi dengan baik.');
      }
    } catch (err) {
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login gagal. Periksa koneksi atau data Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-bg ${animate ? 'animate' : ''}`}>
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className={`auth-card ${animate ? 'animate' : ''}`}>
        <div className="card-header">
          <h2 className="text-center mb-4">
            <i className="bi bi-book me-2"></i>
            Login Petugas
          </h2>
          {error && <div className="alert alert-danger shake-animation">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group floating-label">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              id="email"
              placeholder=" "
              required
              className="form-control"
            />
            <label htmlFor="email">Email</label>
            <i className="bi bi-envelope input-icon"></i>
          </div>

          <div className="form-group floating-label">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              id="password"
              placeholder=" "
              required
              className="form-control"
            />
            <label htmlFor="password">Password</label>
            <i className="bi bi-lock input-icon"></i>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sedang Login...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-center">
            Belum punya akun?{' '}
            <a href="/register" className="auth-link">
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;