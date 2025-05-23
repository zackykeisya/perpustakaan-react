import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Middleware
import PrivateRoute from '../layouts/middleware/PrivateRoute';
import GuestRoute from '../layouts/middleware/GuestRoute';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination'; // Import Pagination component

// Pages
import Login from '../pages/login';
import Register from '../pages/register';
import Dashboard from '../pages/Dashboard';
import Index from '../pages/members/index'; // Member list
import MemberDetail from '../pages/members/MemberDetail';
import BukuIndex from '../pages/books/index'; // Update import to match new file path
import LendingsIndex from '../pages/lendings/index'; // Import halaman utama lendings
import ReturnBook from '../pages/returns/index'; // Import halaman pengembalian buku

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes for unauthenticated users */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Routes for authenticated users */}
      <Route
        element={
          <PrivateRoute>
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <main className="flex-grow-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Index />} /> {/* Halaman Index Members */}
        <Route path="/members/detail/:id" element={<MemberDetail />} />

        {/* Routes for Buku */}
        <Route path="/buku" element={<BukuIndex />} /> {/* Halaman Index Buku */}
        <Route path="/buku/edit/:id" element={<BukuIndex />} /> {/* Halaman Edit Buku */}
        <Route path="/buku/detail/:id" element={<BukuIndex />} /> {/* Halaman Detail Buku */}

        {/* Routes for Lendings */}
        <Route path="/lendings" element={<LendingsIndex />} /> {/* Halaman Index Lendings */}

        {/* Route for Pengembalian Buku */}
        <Route path="/returns" element={<ReturnBook />} /> {/* Halaman Pengembalian Buku */}
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
