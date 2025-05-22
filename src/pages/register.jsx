import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthStyles.css'; // File CSS terpisah untuk animasi

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    c_password: '',
  });
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

    if (form.password !== form.c_password) {
      return setError('Password dan konfirmasi password tidak cocok.');
    }

    setLoading(true);

    try {
      const res = await axios.post(
        'http://45.64.100.26:88/perpus-api/public/api/register',
        form,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Registrasi berhasil! Anda telah login.');
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        const message = err.response.data.message || 'Terjadi kesalahan saat registrasi.';
        setError(message);
      } else {
        setError('Terjadi kesalahan saat registrasi.');
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
            <i className="bi bi-person-plus me-2"></i>
            Registrasi Petugas
          </h2>
          {error && <div className="alert alert-danger shake-animation">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group floating-label">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              id="name"
              placeholder=" "
              required
              className="form-control"
            />
            <label htmlFor="name">Nama Lengkap</label>
            <i className="bi bi-person input-icon"></i>
          </div>

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
              minLength={6}
              className="form-control"
            />
            <label htmlFor="password">Password</label>
            <i className="bi bi-key input-icon"></i>
          </div>

          <div className="form-group floating-label">
            <input
              type="password"
              name="c_password"
              value={form.c_password}
              onChange={handleChange}
              id="c_password"
              placeholder=" "
              required
              className="form-control"
            />
            <label htmlFor="c_password">Konfirmasi Password</label>
            <i className="bi bi-key-fill input-icon"></i>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Mendaftarkan...
              </>
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-center">
            Sudah punya akun?{' '}
            <a href="/login" className="auth-link">
              Login di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;