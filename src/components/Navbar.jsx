import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserName = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      return 'Pengguna';
    }
  
    try {
      return JSON.parse(user).name;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return 'Pengguna';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
      borderBottom: '3px solid #f8d56b'
    }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" style={{ color: '#f8d56b' }}>
          <i className="bi bi-book me-2" style={{ fontSize: '1.5rem' }}></i>
          <span style={{ fontFamily: "'Georgia', serif" }}>Perpustakaan Digital</span>
        </Link>
        
        {/* Hamburger Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          style={{ 
            borderColor: '#f8d56b',
            outline: 'none',
            boxShadow: 'none'
          }}
        >
          <span className="navbar-toggler-icon" style={{ color: '#f8d56b' }}>
            {isMenuOpen ? (
              <i className="bi bi-x-lg" style={{ fontSize: '1.5rem', color: '#f8d56b' }}></i>
            ) : (
              <i className="bi bi-list" style={{ fontSize: '1.5rem', color: '#f8d56b' }}></i>
            )}
          </span>
        </button>
        
        {/* Collapsible Menu */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item mx-1" onClick={() => setIsMenuOpen(false)}>
              <Link 
                className="nav-link d-flex align-items-center py-3" 
                to="/members"
                style={{ 
                  color: 'white',
                  borderBottom: '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-people-fill me-2"></i>
                Anggota
              </Link>
            </li>
            
            <li className="nav-item mx-1" onClick={() => setIsMenuOpen(false)}>
              <Link 
                className="nav-link d-flex align-items-center py-3" 
                to="/buku"
                style={{ 
                  color: 'white',
                  borderBottom: '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-book-fill me-2"></i>
                Koleksi Buku
              </Link>
            </li>
            
            <li className="nav-item mx-1" onClick={() => setIsMenuOpen(false)}>
              <Link 
                className="nav-link d-flex align-items-center py-3" 
                to="/lendings"
                style={{ 
                  color: 'white',
                  borderBottom: '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-clipboard-check-fill me-2"></i>
                Peminjaman
              </Link>
            </li>
            
            <li className="nav-item mx-1" onClick={() => setIsMenuOpen(false)}>
              <Link 
                className="nav-link d-flex align-items-center py-3" 
                to="/returns"
                style={{ 
                  color: 'white',
                  borderBottom: '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-arrow-return-right me-2"></i>
                Pengembalian
              </Link>
            </li>
          </ul>
          
          <div className="d-flex flex-column flex-lg-row align-items-center py-3 py-lg-0">
            <div className="me-lg-3 mb-3 mb-lg-0 text-center text-lg-start">
              <i className="bi bi-person-circle me-2" style={{ color: '#f8d56b' }}></i>
              <span style={{ color: 'white' }}>
                {getUserName()}
              </span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-logout d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: 'transparent',
                color: '#f8d56b',
                border: '1px solid #f8d56b',
                borderRadius: '5px',
                padding: '8px 15px',
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '200px'
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}