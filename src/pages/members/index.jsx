import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MemberList({ onChange }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://45.64.100.26:88/perpus-api/public/api/member", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setError("Data tidak dalam format array.");
      }
    } catch (error) {
      setError('Gagal mengambil data member: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (member = null) => {
    if (member) {
      setForm({
        no_ktp: member.no_ktp,
        nama: member.nama,
        alamat: member.alamat,
        tgl_lahir: member.tgl_lahir,
      });
      setEditId(member.id);
    } else {
      setForm({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
      setEditId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      if (editId) {
        await axios.put(`http://45.64.100.26:88/perpus-api/public/api/member/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://45.64.100.26:88/perpus-api/public/api/member", form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setForm({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
      setEditId(null);
      setShowModal(false);
      await fetchMembers();

      if (onChange) onChange();
    } catch (error) {
      setError('Gagal menyimpan data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus member ini?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://45.64.100.26:88/perpus-api/public/api/member/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();

      if (onChange) onChange();
    } catch (error) {
      setError('Gagal menghapus member: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRowClick = (id) => {
    navigate(`/members/detail/${id}`);
  };

  const filteredMembers = members.filter(member =>
    member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.no_ktp.includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container-fluid py-4 library-theme">
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-users me-2"></i>
              Manajemen Member Perpustakaan
            </h2>
            <button 
              className="btn btn-light" 
              onClick={() => openModal()}
            >
              <i className="fas fa-plus me-1"></i> Tambah Member
            </button>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari member berdasarkan nama atau no KTP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Memuat...</span>
              </div>
              <p className="mt-2">Memuat data member...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="5%">No</th>
                    <th width="15%">No KTP</th>
                    <th width="25%">Nama</th>
                    <th width="30%">Alamat</th>
                    <th width="15%">Tgl Lahir</th>
                    <th width="10%">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length > 0 ? (
                    currentMembers.map((m, index) => (
                      <tr 
                        key={m.id} 
                        onClick={() => handleRowClick(m.id)} 
                        className="hover-row" 
                        title="Lihat Detail"
                      >
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{m.no_ktp}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-info text-white rounded-circle me-3 d-flex align-items-center justify-content-center">
                              {m.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h6 className="mb-0">{m.nama}</h6>
                              <small className="text-muted">ID: {m.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{m.alamat}</td>
                        <td>{new Date(m.tgl_lahir).toLocaleDateString('id-ID')}</td>
                        <td>
                          <td>
  <div className="btn-group" role="group">
    <button
      className="btn btn-outline-primary action-btn"
      onClick={(e) => {
        e.stopPropagation();
        openModal(m);
      }}
      title="Edit"
    >
      <i className="bi bi-pencil me-1"></i>Edit
    </button>
    <button
      className="btn btn-outline-danger action-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(m.id);
      }}
      title="Hapus"
    >
      <i className="bi bi-trash me-1"></i>Hapus
    </button>
  </div>
</td>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="empty-state">
                          <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
                          <h5>Tidak ada data member</h5>
                          <p className="text-muted">
                            {searchTerm 
                              ? "Tidak ditemukan member dengan kriteria pencarian tersebut" 
                              : "Belum ada member yang terdaftar"}
                          </p>
                          {!searchTerm && (
                            <button 
                              className="btn btn-primary"
                              onClick={() => openModal()}
                            >
                              <i className="fas fa-plus me-1"></i> Tambah Member Pertama
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left me-1"></i> Sebelumnya
            </button>
            <span>Halaman {currentPage} dari {Math.ceil(filteredMembers.length / itemsPerPage)}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredMembers.length / itemsPerPage)}
            >
              Selanjutnya <i className="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-user-edit me-2"></i>
                    {editId ? "Edit Data Member" : "Tambah Member Baru"}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">No KTP</label>
                    <input 
                      type="text" 
                      name="no_ktp" 
                      className="form-control" 
                      placeholder="Masukkan nomor KTP" 
                      value={form.no_ktp} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="nama" 
                      className="form-control" 
                      placeholder="Masukkan nama lengkap" 
                      value={form.nama} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <textarea 
                      name="alamat" 
                      className="form-control" 
                      placeholder="Masukkan alamat lengkap" 
                      value={form.alamat} 
                      onChange={handleChange} 
                      required 
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tanggal Lahir</label>
                    <input 
                      type="date" 
                      name="tgl_lahir" 
                      className="form-control" 
                      value={form.tgl_lahir} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fas fa-times me-1"></i> Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    <i className="fas fa-save me-1"></i> 
                    {editId ? "Update Data" : "Simpan Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .library-theme {
          background-color: #f8f9fa;
        }
        .hover-row:hover {
          background-color: #f0f8ff !important;
          cursor: pointer;
        }
        .avatar-sm {
          width: 36px;
          height: 36px;
          font-weight: bold;
        }
        .empty-state {
          padding: 2rem;
          text-align: center;
        }
        .card {
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .table th {
          background-color: #e9f2ff;
          color: #0d6efd;
        }
      `}</style>
    </div>
  );
}