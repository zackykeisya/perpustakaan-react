import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    id: null,
    no_rak: '',
    judul: '',
    pengarang: '',
    tahun_terbit: '',
    penerbit: '',
    stok: '',
    detail: '',
  });
  const [bookDetail, setBookDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      if (!token) {
        alert('Token tidak tersedia. Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://45.64.100.26:88/perpus-api/public/api/buku',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const responseData = response.data;
      console.log('Full Response:', responseData);

      if (Array.isArray(responseData)) {
        setBooks(responseData);
      } else {
        console.warn('Struktur data tidak sesuai:', responseData);
        setBooks([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data buku:', error);
      alert('Gagal mengambil data buku dari server');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetail = async (id) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(
        `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      setBookDetail(response.data);
    } catch (error) {
      console.error('Gagal mengambil detail buku:', error);
      alert('Gagal mengambil detail buku');
    } finally {
      setDetailLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: null,
      no_rak: '',
      judul: '',
      pengarang: '',
      tahun_terbit: '',
      penerbit: '',
      stok: '',
      detail: '',
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setModalMode('edit');
    setFormData({
      id: book.id,
      no_rak: book.no_rak || '',
      judul: book.judul || '',
      pengarang: book.pengarang || '',
      tahun_terbit: book.tahun_terbit || '',
      penerbit: book.pengarang || '',
      stok: book.stok || '',
      detail: book.detail || '',
    });
    setShowModal(true);
  };

  const openDetailModal = async (book) => {
    await fetchBookDetail(book.id);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tahun_terbit: formData.tahun_terbit.toString(),
      stok: formData.stok.toString(),
    };

    try {
      if (modalMode === 'add') {
        const response = await axios.post(
          'http://45.64.100.26:88/perpus-api/public/api/buku',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.data && response.data.data) {
          setBooks((prevBooks) => [...prevBooks, response.data.data]);
          alert('Buku berhasil ditambahkan');
        } else {
          alert('Gagal menambahkan buku. Data tidak valid.');
        }
      } else {
        await axios.put(
          `http://45.64.100.26:88/perpus-api/public/api/buku/${formData.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === formData.id ? { ...payload, id: formData.id } : book
          )
        );
        alert('Buku berhasil diupdate');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saat menyimpan buku:', error);
      alert('Gagal menyimpan data buku');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah kamu yakin ingin menghapus buku ini?')) return;

    try {
      await axios.delete(
        `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      alert('Buku berhasil dihapus');
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error('Gagal menghapus buku:', error);
      alert('Terjadi kesalahan saat menghapus buku.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header with Library Theme */}
      <div className="library-header bg-primary bg-opacity-10 p-4 rounded-4 mb-4 border-start border-5 border-primary">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="text-primary fw-bold mb-1">
              <i className="bi bi-book me-2"></i>Katalog Buku
            </h1>
            <p className="text-muted mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Manajemen koleksi buku perpustakaan
            </p>
          </div>
          <button 
            className="btn btn-primary btn-lg shadow-sm"
            onClick={openAddModal}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Tambah Buku
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="library-card bg-white rounded-4 shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Memuat koleksi buku...</p>
          </div>
        ) : (
          <>
            {books.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">#</th>
                      <th>No Rak</th>
                      <th>Judul</th>
                      <th>Pengarang</th>
                      <th>Tahun</th>
                      <th>Penerbit</th>
                      <th>Stok</th>
                      <th className="text-end pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book, index) => (
                      <tr 
                        key={book.id} 
                        className="book-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openDetailModal(book)}
                      >
                        <td className="ps-4">{index + 1}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {book.no_rak}
                          </span>
                        </td>
                        <td>
                          <strong>{book.judul}</strong>
                          {book.detail && (
                            <p className="text-muted small mb-0">{book.detail}</p>
                          )}
                        </td>
                        <td>{book.pengarang}</td>
                        <td>{book.tahun_terbit}</td>
                        <td>{book.penerbit}</td>
                        <td>
                          <span className={`badge ${book.stok > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {book.stok}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-primary action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(book);
                              }}
                              title="Edit"
                            >
                              <i className="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button
                              className="btn btn-outline-danger action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(book.id);
                              }}
                              title="Hapus"
                            >
                              <i className="bi bi-trash me-1"></i>Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-book text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">Tidak ada data buku</h5>
                <button className="btn btn-primary mt-3" onClick={openAddModal}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Tambah Buku Pertama
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-book me-2"></i>
                  {modalMode === 'add' ? 'Tambah Buku Baru' : 'Edit Data Buku'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {[
                      ['no_rak', 'Nomor Rak', 'text'],
                      ['judul', 'Judul Buku', 'text'],
                      ['pengarang', 'Pengarang', 'text'],
                      ['tahun_terbit', 'Tahun Terbit', 'number'],
                      ['penerbit', 'Penerbit', 'text'],
                      ['stok', 'Jumlah Stok', 'number'],
                    ].map(([name, label, type]) => (
                      <div className="col-md-6" key={name}>
                        <div className="form-floating">
                          <input
                            type={type}
                            className="form-control"
                            id={name}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            required
                            placeholder={label}
                          />
                          <label htmlFor={name}>{label}</label>
                        </div>
                      </div>
                    ))}
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          id="detail"
                          name="detail"
                          style={{ height: '100px' }}
                          value={formData.detail}
                          onChange={handleChange}
                          placeholder="Detail Buku"
                        ></textarea>
                        <label htmlFor="detail">Detail Buku</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCloseModal}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-1"></i>
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Book Modal */}
      {showDetailModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-book me-2"></i>
                  Detail Buku
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={handleCloseDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                {detailLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Memuat detail buku...</p>
                  </div>
                ) : (
                  bookDetail && (
                    <div className="row">
                      <div className="col-md-4 text-center mb-3">
                        <div className="book-cover-placeholder bg-light p-4 rounded">
                          <i className="bi bi-book text-primary" style={{ fontSize: '4rem' }}></i>
                        </div>
                      </div>
                      <div className="col-md-8">
                        <h4 className="mb-3">{bookDetail.judul}</h4>
                        <div className="mb-3">
                          <h6 className="text-muted">Informasi Buku</h6>
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item px-0 py-2">
                              <strong>No Rak:</strong> {bookDetail.no_rak}
                            </li>
                            <li className="list-group-item px-0 py-2">
                              <strong>Pengarang:</strong> {bookDetail.pengarang}
                            </li>
                            <li className="list-group-item px-0 py-2">
                              <strong>Penerbit:</strong> {bookDetail.penerbit}
                            </li>
                            <li className="list-group-item px-0 py-2">
                              <strong>Tahun Terbit:</strong> {bookDetail.tahun_terbit}
                            </li>
                            <li className="list-group-item px-0 py-2">
                              <strong>Stok Tersedia:</strong> 
                              <span className={`badge ms-2 ${bookDetail.stok > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {bookDetail.stok}
                              </span>
                            </li>
                          </ul>
                        </div>
                        {bookDetail.detail && (
                          <div className="mb-3">
                            <h6 className="text-muted">Deskripsi</h6>
                            <p className="text-justify">{bookDetail.detail}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloseDetailModal}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .book-row:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }
        .book-cover-placeholder {
          border: 1px dashed #dee2e6;
        }
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default BookList;