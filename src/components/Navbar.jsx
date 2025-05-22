import React from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserName = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      return 'Pengguna'; // Fallback jika user tidak ditemukan
    }
  
    try {
      return JSON.parse(user).name;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return 'Pengguna'; // Fallback jika parsing gagal
    }
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
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: '#f8d56b' }}
        >
          <i className="bi bi-list" style={{ color: '#f8d56b' }}></i>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item mx-1">
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
            
            <li className="nav-item mx-1">
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
            
            <li className="nav-item mx-1">
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
            
            <li className="nav-item mx-1">
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
          
          <div className="d-flex align-items-center">
            <div className="me-3 d-none d-lg-block">
              <i className="bi bi-person-circle me-2" style={{ color: '#f8d56b' }}></i>
              <span style={{ color: 'white' }}>
                {getUserName()}
              </span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-logout d-flex align-items-center"
              style={{
                backgroundColor: 'transparent',
                color: '#f8d56b',
                border: '1px solid #f8d56b',
                borderRadius: '5px',
                padding: '8px 15px',
                transition: 'all 0.3s ease'
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