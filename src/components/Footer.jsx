import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-library-theme text-light pt-5 pb-4" style={{ 
      background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
      borderTop: '3px solid #f8d56b'
    }}>
      <div className="container">
        <div className="row">

          {/* About */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#f8d56b' }}>
              <i className="bi bi-book me-2"></i>Tentang Perpustakaan
            </h5>
            <p style={{ textAlign: 'justify' }}>
              Perpustakaan kami menyediakan berbagai koleksi buku untuk mendukung kebutuhan belajar, penelitian, dan hiburan Anda. 
              Kami berkomitmen untuk memberikan layanan terbaik kepada para anggota.
            </p>
            <div className="mt-3">
              <i className="bi bi-clock-fill me-2" style={{ color: '#f8d56b' }}></i>
              <span>Buka Senin-Jumat: 08.00 - 17.00 WIB</span>
            </div>
          </div>

          {/* Useful Links */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#f8d56b' }}>
              <i className="bi bi-link-45deg me-2"></i>Tautan Berguna
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none hover-gold">
                  <i className="bi bi-house-door-fill me-2"></i>Beranda
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/members" className="text-light text-decoration-none hover-gold">
                  <i className="bi bi-people-fill me-2"></i>Daftar Member
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/buku" className="text-light text-decoration-none hover-gold">
                  <i className="bi bi-book-fill me-2"></i>Manajemen Buku
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/lendings" className="text-light text-decoration-none hover-gold">
                  <i className="bi bi-clipboard-check-fill me-2"></i>Peminjaman
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-light text-decoration-none hover-gold">
                  <i className="bi bi-telephone-fill me-2"></i>Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#f8d56b' }}>
              <i className="bi bi-headset me-2"></i>Hubungi Kami
            </h5>
            <p className="d-flex align-items-center mb-3">
              <i className="bi bi-geo-alt-fill me-3" style={{ color: '#f8d56b', fontSize: '1.2rem' }}></i>
              <span>Jl. Perpustakaan No. 123, Jakarta</span>
            </p>
            <p className="d-flex align-items-center mb-3">
              <i className="bi bi-telephone-fill me-3" style={{ color: '#f8d56b', fontSize: '1.2rem' }}></i>
              <span>+62 812-3456-7890</span>
            </p>
            <p className="d-flex align-items-center">
              <i className="bi bi-envelope-fill me-3" style={{ color: '#f8d56b', fontSize: '1.2rem' }}></i>
              <span>info@perpustakaan.com</span>
            </p>
          </div>

          {/* Social Media */}
          <div className="col-md-3 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#f8d56b' }}>
              <i className="bi bi-megaphone-fill me-2"></i>Ikuti Kami
            </h5>
            <div className="mb-4">
              <a href="#" className="btn btn-social me-2" style={{ 
                backgroundColor: '#f8d56b', 
                color: '#2c3e50',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="btn btn-social me-2" style={{ 
                backgroundColor: '#f8d56b', 
                color: '#2c3e50',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="btn btn-social me-2" style={{ 
                backgroundColor: '#f8d56b', 
                color: '#2c3e50',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="btn btn-social" style={{ 
                backgroundColor: '#f8d56b', 
                color: '#2c3e50',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
            <div className="newsletter">
              <h6 className="mb-3" style={{ color: '#f8d56b' }}>Berlangganan Newsletter</h6>
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Email Anda" 
                  style={{ borderRadius: '0' }}
                />
                <button 
                  className="btn btn-warning" 
                  type="button"
                  style={{ backgroundColor: '#f8d56b', color: '#2c3e50' }}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>

        </div>

        <hr style={{ borderColor: 'rgba(248, 213, 107, 0.3)' }} />
        <div className="text-center pt-3">
          <p className="mb-0">
            <i className="bi bi-c-circle me-1"></i>
            {new Date().getFullYear()} Perpustakaan Digital. Hak Cipta Dilindungi.
          </p>
          <p className="mt-2">
            <small>
              <i className="bi bi-info-circle-fill me-1"></i>
              Sistem Peminjaman Buku Online - Versi 1.0
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;