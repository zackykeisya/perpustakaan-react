import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Lending = () => {
  const [lendings, setLendings] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [formData, setFormData] = useState({
    id_member: '',
    id_buku: '',
    tgl_pinjam: '',
    tgl_pengembalian: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [borrowingsData, setBorrowingsData] = useState([]);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert('Token tidak tersedia. Silakan login terlebih dahulu.');
      return;
    }
    fetchLendings();
    fetchMembers();
    fetchBooks();
    fetchMonthlyStats();
  }, []);

  const fetchLendings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        'http://45.64.100.26:88/perpus-api/public/api/peminjaman',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLendings(data.data || data);
    } catch (err) {
      console.error('Gagal mengambil data peminjaman:', err.message);
      alert('Gagal mengambil data peminjaman. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithRetry = async (url, options, retries = 3) => {
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (err) {
      if (retries > 0) {
        console.warn(`Retrying... (${3 - retries + 1})`);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw err;
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const data = await fetchWithRetry(
        'http://45.64.100.26:88/perpus-api/public/api/member',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(data.data || data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data member');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const { data } = await axios.get(
        'http://45.64.100.26:88/perpus-api/public/api/buku',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(data.data || data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data buku');
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const { data } = await axios.get(
        'http://45.64.100.26:88/perpus-api/public/api/peminjaman',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const monthlyStats = processMonthlyStats(data.data || data);
      setBorrowingsData(monthlyStats);
    } catch (err) {
      console.error('Gagal mengambil data statistik:', err.message);
      setBorrowingsData([
        { month: 'Jan', borrowings: 20 },
        { month: 'Feb', borrowings: 35 },
        { month: 'Mar', borrowings: 50 },
        { month: 'Apr', borrowings: 40 },
        { month: 'Mei', borrowings: 60 },
        { month: 'Jun', borrowings: 30 },
      ]);
    }
  };

  const processMonthlyStats = (lendings) => {
    if (!lendings || lendings.length === 0) return [];
    
    const monthlyCounts = {};
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    lendings.forEach(lending => {
      const date = new Date(lending.tgl_pinjam);
      const month = date.getMonth();
      const monthName = monthNames[month];
      
      if (monthlyCounts[monthName]) {
        monthlyCounts[monthName]++;
      } else {
        monthlyCounts[monthName] = 1;
      }
    });
    
    const result = monthNames.map(month => ({
      month,
      borrowings: monthlyCounts[month] || 0
    }));
    
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://45.64.100.26:88/perpus-api/public/api/peminjaman',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Peminjaman berhasil ditambahkan');
      setFormData({ id_member: '', id_buku: '', tgl_pinjam: '', tgl_pengembalian: '' });
      fetchLendings();
      fetchMonthlyStats();
    } catch (err) {
      console.error(err);
      alert('Gagal menambah peminjaman');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = lendings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lendings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await axios.put(
        `http://45.64.100.26:88/perpus-api/public/api/peminjaman/pengembalian/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response:', response.data);
      alert('Buku berhasil dikembalikan');
      fetchLendings();
      fetchMonthlyStats();
    } catch (err) {
      console.error('Error saat mengembalikan buku:', err.response || err.message);
      alert(`Gagal mengembalikan buku: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleExportToExcel = () => {
    if (lendings.length === 0) {
      alert('Tidak ada data peminjaman untuk diexport.');
      return;
    }

    const dataToExport = lendings.map((lending) => ({
      ID: lending.id,
      Member: members.find((m) => m.id === lending.id_member)?.nama || 'member tidak aktif',
      Buku: books.find((b) => b.id === lending.id_buku)?.judul || 'buku tidak tersedia',
      'Tanggal Pinjam': lending.tgl_pinjam,
      'Tanggal Pengembalian': lending.tgl_pengembalian || 'Belum',
      Status: lending.status_pengembalian === 1 ? 'Dikembalikan' : 'Dipinjam',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peminjaman');
    XLSX.writeFile(workbook, 'Data_Peminjaman.xlsx');
  };

  const toggleChartModal = () => {
    setIsChartModalOpen(!isChartModalOpen);
  };

  return (
    <div className="container mt-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 shadow-sm">
        <h1 className="text-primary fw-bold mb-0">
          <i className="bi bi-book me-2"></i>Peminjaman Buku
        </h1>
        <button 
          className="btn btn-success d-flex align-items-center"
          onClick={handleExportToExcel}
        >
          <i className="bi bi-file-earmark-excel me-2"></i>
          Export ke Excel
        </button>
      </div>

      {/* Statistics Button */}
      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-lg rounded-pill px-4"
          onClick={toggleChartModal}
        >
          <i className="bi bi-bar-chart-line me-2"></i>
          Lihat Statistik Peminjaman Bulanan
        </button>
      </div>

      {/* Add Lending Form Card */}
      <div className="card mb-4 border-0 shadow-lg">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-plus-circle me-2"></i>Tambah Data Peminjaman
          </h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Member Dropdown */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    id="id_member"
                    name="id_member"
                    className="form-select"
                    value={formData.id_member}
                    onChange={handleInputChange}
                    required
                    disabled={loadingMembers}
                  >
                    <option value="">
                      {loadingMembers ? 'Memuat member...' : 'Pilih Member'}
                    </option>
                    {!loadingMembers && members.length === 0 && (
                      <option value="">Tidak ada member</option>
                    )}
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.nama}</option>
                    ))}
                  </select>
                  <label htmlFor="id_member" className="form-label">
                    <i className="bi bi-person me-2"></i>Nama Member
                  </label>
                </div>
              </div>

              {/* Book Dropdown */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    id="id_buku"
                    name="id_buku"
                    className="form-select"
                    value={formData.id_buku}
                    onChange={handleInputChange}
                    required
                    disabled={loadingBooks}
                  >
                    <option value="">
                      {loadingBooks ? 'Memuat buku...' : 'Pilih Buku'}
                    </option>
                    {!loadingBooks && books.length === 0 && (
                      <option value="">Tidak ada buku</option>
                    )}
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.judul}</option>
                    ))}
                  </select>
                  <label htmlFor="id_buku" className="form-label">
                    <i className="bi bi-book me-2"></i>Judul Buku
                  </label>
                </div>
              </div>

              {/* Dates */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="date"
                    id="tgl_pinjam"
                    name="tgl_pinjam"
                    className="form-control"
                    value={formData.tgl_pinjam}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="tgl_pinjam" className="form-label">
                    <i className="bi bi-calendar me-2"></i>Tanggal Pinjam
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="date"
                    id="tgl_pengembalian"
                    name="tgl_pengembalian"
                    className="form-control"
                    value={formData.tgl_pengembalian}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="tgl_pengembalian" className="form-label">
                    <i className="bi bi-calendar-check me-2"></i>Tanggal Pengembalian
                  </label>
                </div>
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-primary btn-lg w-100 py-2">
                  <i className="bi bi-save me-2"></i>Tambah Peminjaman
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* List Lendings */}
      {loading ? (
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Memuat data peminjaman...</p>
        </div>
      ) : (
        <>
          <h4 className="mb-4 text-muted">
            <i className="bi bi-list-ul me-2"></i>Daftar Peminjaman
          </h4>
          
          <div className="row g-4 lendings-container">
            {currentItems.length > 0 ? (
              currentItems.map((l) => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={l.id}>
                  <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title text-primary mb-0">
                          <i className="bi bi-bookmark me-2"></i>ID: {l.id}
                        </h5>
                        <span className={`badge rounded-pill ${l.status_pengembalian === 1 ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {l.status_pengembalian === 1 ? 'Dikembalikan' : 'Dipinjam'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="mb-2">
                          <i className="bi bi-person me-2 text-secondary"></i>
                          <strong>Member:</strong> {members.find(m => m.id == l.id_member)?.nama || 'member sudah tidak aktif'}
                        </p>
                        <p className="mb-2">
                          <i className="bi bi-book me-2 text-secondary"></i>
                          <strong>Buku:</strong> {books.find(b => b.id == l.id_buku)?.judul || 'buku sudah tidak tersedia'}
                        </p>
                        <p className="mb-2">
                          <i className="bi bi-calendar me-2 text-secondary"></i>
                          <strong>Tgl Pinjam:</strong> {l.tgl_pinjam}
                        </p>
                        <p className="mb-0">
                          <i className="bi bi-calendar-check me-2 text-secondary"></i>
                          <strong>Tgl Kembali:</strong> {l.tgl_pengembalian || 'Belum'}
                        </p>
                      </div>
                      
                      {l.status_pengembalian !== 1 && (
                        <button
                          className="btn btn-primary w-100 mt-auto"
                          onClick={() => handleReturn(l.id)}
                        >
                          <i className="bi bi-arrow-return-left me-2"></i>
                          Pengembalian
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5 bg-light rounded-3">
                  <i className="bi bi-inbox text-muted" style={{fontSize: '3rem'}}></i>
                  <h5 className="mt-3 text-muted">Tidak ada data peminjaman</h5>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination-container d-flex justify-content-center align-items-center mt-4">
            <button
              className="btn btn-outline-primary me-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <i className="bi bi-chevron-left me-1"></i> Sebelumnya
            </button>
            
            <span className="mx-3">
              Halaman {currentPage} dari {totalPages}
            </span>
            
            <button
              className="btn btn-outline-primary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              Selanjutnya <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </>
      )}

      {/* Chart Modal */}
      {isChartModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-bar-chart-line me-2"></i>
                  Statistik Peminjaman Bulanan
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={toggleChartModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ height: '400px' }}>
                  {borrowingsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={borrowingsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6c757d' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6c757d' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value) => [`${value} Peminjaman`, 'Jumlah']}
                        />
                        <Legend 
                          formatter={(value) => <span className="text-primary">{value}</span>}
                        />
                        <Bar
                          dataKey="borrowings"
                          name="Jumlah Peminjaman"
                          fill="#0d6efd"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-bar-chart text-muted fs-1"></i>
                      <p className="mt-3">Tidak ada data peminjaman</p>
                    </div>
                  )}
                </div>
                
                {/* Additional Statistics */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="card-title text-muted">
                          <i className="bi bi-calendar-check me-2"></i>
                          Total Peminjaman Tahun Ini
                        </h6>
                        <h3 className="text-primary">
                          {borrowingsData.reduce((sum, item) => sum + item.borrowings, 0)}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="card-title text-muted">
                          <i className="bi bi-graph-up me-2"></i>
                          Bulan Tertinggi
                        </h6>
                        {borrowingsData.length > 0 ? (
                          <>
                            <h3 className="text-success">
                              {Math.max(...borrowingsData.map(item => item.borrowings))}
                            </h3>
                            <p className="mb-0 text-muted">
                              pada bulan {
                                borrowingsData.find(item => 
                                  item.borrowings === Math.max(...borrowingsData.map(i => i.borrowings))
                                )?.month
                              }
                            </p>
                          </>
                        ) : (
                          <p className="mb-0">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={toggleChartModal}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lending;