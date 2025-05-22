import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ReturnBook() {
  const [idPeminjaman, setIdPeminjaman] = useState('');
  const [idMember, setIdMember] = useState('');
  const [idBuku, setIdBuku] = useState('');
  const [denda, setDenda] = useState('');
  const [jenisDenda, setJenisDenda] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [members, setMembers] = useState([]);
  const [buku, setBuku] = useState([]);
  const [dendaList, setDendaList] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda belum login. Silakan login terlebih dahulu.');
      navigate('/login');
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [membersResponse, bukuResponse, dendaResponse, peminjamanResponse] = await Promise.all([
          axios.get('http://45.64.100.26:88/perpus-api/public/api/member', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://45.64.100.26:88/perpus-api/public/api/buku', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://45.64.100.26:88/perpus-api/public/api/denda', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://45.64.100.26:88/perpus-api/public/api/peminjaman', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMembers(membersResponse.data);
        setBuku(bukuResponse.data);
        setDendaList(dendaResponse.data.data);
        setPeminjaman(
          peminjamanResponse.data.data.map((item) => ({
            ...item,
            memberName: membersResponse.data.find((m) => m.id === item.id_member)?.nama || 'Unknown',
            bookTitle: bukuResponse.data.find((b) => b.id === item.id_buku)?.judul || 'Unknown',
          }))
        );
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePeminjamanChange = (id) => {
    setIdPeminjaman(id);
    const selectedPeminjaman = peminjaman.find((item) => item.id === parseInt(id));
    if (selectedPeminjaman) {
      setIdMember(selectedPeminjaman.id_member);
      setIdBuku(selectedPeminjaman.id_buku);
    } else {
      setIdMember('');
      setIdBuku('');
    }
  };

  const handleReturn = async () => {
    const apiUrl = 'http://45.64.100.26:88/perpus-api/public/api/denda';

    if (!idMember || !idBuku || !denda || !jenisDenda || !deskripsi) {
      alert('Semua field harus diisi.');
      return;
    }

    const payload = {
      id_member: idMember,
      id_buku: idBuku,
      jumlah_denda: denda,
      jenis_denda: jenisDenda,
      deskripsi: deskripsi,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(apiUrl, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Pengembalian berhasil diproses.');

      const dendaResponse = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDendaList(dendaResponse.data.data);
      
      // Reset form
      setIdPeminjaman('');
      setIdMember('');
      setIdBuku('');
      setDenda('');
      setJenisDenda('');
      setDeskripsi('');
    } catch (error) {
      console.error('Error saat memproses pengembalian:', error);
      alert('Terjadi kesalahan saat memproses pengembalian.');
    }
  };

  const handleLunas = async (id) => {
    const apiUrl = `http://45.64.100.26:88/perpus-api/public/api/denda/${id}`;

    if (!window.confirm('Apakah Anda yakin ingin melunaskan denda ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Denda telah lunas.');

      // Perbarui daftar denda setelah penghapusan
      const dendaResponse = await axios.get('http://45.64.100.26:88/perpus-api/public/api/denda', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDendaList(dendaResponse.data.data);
    } catch (error) {
      console.error('Gagal melunaskan data denda:', error);
      alert('Terjadi kesalahan saat melunas data denda.');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDendaList = dendaList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dendaList.length / itemsPerPage);

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

  return (
    <div className="container-fluid px-0">

      {/* Main Content */}
      <main className="container my-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb bg-light p-3 rounded shadow-sm">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none">
                <i className="bi bi-house-door"></i> Home
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Pengembalian Buku
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold">
            <i className="bi bi-arrow-return-right me-2"></i>
            Pengembalian Buku
          </h2>
        </div>

        {/* Return Book Form */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-primary text-white py-3">
                <h4 className="card-title mb-0">
                  <i className="bi bi-bookmark-check me-2"></i>
                  Form Pengembalian Buku
                </h4>
              </div>
              <div className="card-body p-4">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="idPeminjaman"
                          value={idPeminjaman}
                          onChange={(e) => handlePeminjamanChange(e.target.value)}
                        >
                          <option value="">Pilih ID Peminjaman</option>
                          {peminjaman.map((item) => (
                            <option key={item.id} value={item.id}>
                              {`ID: ${item.id} - ${item.memberName} - ${item.bookTitle}`}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="idPeminjaman" className="form-label">
                          <i className="bi bi-journal-bookmark me-2"></i>
                          ID Peminjaman
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="idMember"
                          value={members.find((member) => member.id === parseInt(idMember))?.nama || ''}
                          readOnly
                        />
                        <label htmlFor="idMember" className="form-label">
                          <i className="bi bi-person-vcard me-2"></i>
                          Nama Member
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="idBuku"
                          value={buku.find((book) => book.id === parseInt(idBuku))?.judul || ''}
                          readOnly
                        />
                        <label htmlFor="idBuku" className="form-label">
                          <i className="bi bi-book me-2"></i>
                          Judul Buku
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          id="denda"
                          value={denda}
                          onChange={(e) => setDenda(e.target.value)}
                          placeholder="1000"
                        />
                        <label htmlFor="denda" className="form-label">
                          <i className="bi bi-cash-coin me-2"></i>
                          Jumlah Denda (Rp)
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="jenisDenda"
                          value={jenisDenda}
                          onChange={(e) => setJenisDenda(e.target.value)}
                        >
                          <option value="">Pilih Jenis Denda</option>
                          <option value="terlambat">Terlambat</option>
                          <option value="kerusakan">Kerusakan</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                        <label htmlFor="jenisDenda" className="form-label">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Jenis Denda
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          id="deskripsi"
                          value={deskripsi}
                          onChange={(e) => setDeskripsi(e.target.value)}
                          placeholder="Deskripsi denda"
                          style={{ height: '100px' }}
                        />
                        <label htmlFor="deskripsi" className="form-label">
                          <i className="bi bi-card-text me-2"></i>
                          Deskripsi
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <button 
                        className="btn btn-primary btn-lg w-100 py-3 shadow"
                        onClick={handleReturn}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Proses Pengembalian
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Denda Table */}
        <div className="card border-0 shadow-lg mb-5">
          <div className="card-header bg-primary text-white py-3">
            <h4 className="card-title mb-0">
              <i className="bi bi-list-check me-2"></i>
              Daftar Denda
            </h4>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">ID</th>
                    <th>Member</th>
                    <th>Buku</th>
                    <th className="text-end">Jumlah Denda</th>
                    <th className="text-center">Jenis</th>
                    <th>Deskripsi</th>
                    <th className="text-center">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDendaList.length > 0 ? (
                    currentDendaList.map((item) => (
                      <tr
                        key={item.id}
                        className="hover-row"
                        onClick={() => navigate(`/members/detail/${item.id_member}`)}
                        title="Lihat Detail Member"
                      >
                        <td className="text-center fw-bold">{item.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            <span>
                              {members.find((member) => member.id === item.id_member)?.nama || 'Tidak Ditemukan'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-book me-2 text-success"></i>
                            <span>
                              {buku.find((book) => book.id === item.id_buku)?.judul || 'Tidak Ditemukan'}
                            </span>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-danger">
                          Rp {parseInt(item.jumlah_denda).toLocaleString()}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge rounded-pill ${
                              item.jenis_denda === 'terlambat'
                                ? 'bg-warning text-dark'
                                : item.jenis_denda === 'kerusakan'
                                ? 'bg-danger'
                                : 'bg-secondary'
                            }`}
                          >
                            {item.jenis_denda}
                          </span>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                          {item.deskripsi}
                        </td>
                        <td className="text-center text-muted">
                          <small>{new Date(item.created_at).toLocaleDateString()}</small>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-outline-success action-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah event dari `tr` ter-trigger
                              handleLunas(item.id);
                            }}
                            title="Lunas"
                          >
                            <i className="bi bi-check-circle me-1"></i>Lunas
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <i className="bi bi-database-fill-x fs-1"></i>
                        <p className="mt-2">Tidak ada data denda</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <button
                className="btn btn-outline-primary"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left me-1"></i> Sebelumnya
              </button>
              <span className="text-muted">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                className="btn btn-outline-primary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Selanjutnya <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}