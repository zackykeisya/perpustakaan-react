import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from '../../components/Pagination';

export default function MemberDetail() {
  const [member, setMember] = useState(null);
  const [peminjaman, setPeminjaman] = useState([]);
  const [denda, setDenda] = useState([]);
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { id } = useParams();

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Anda belum login. Silakan login terlebih dahulu.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch data buku
        const bukuRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/buku`, { headers });
        setBuku(bukuRes.data.data || bukuRes.data || []);

        // Fetch data member
        const memberRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/member/${id}`, { headers });
        setMember(memberRes.data);

        // Fetch data peminjaman
        const peminjamanRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/peminjaman/${id}`, { headers });
        setPeminjaman(peminjamanRes.data.data || peminjamanRes.data || []);

        // Fetch data denda
        const dendaRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/denda/${id}`, { headers });
        setDenda(dendaRes.data.data || dendaRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message === "Network Error") {
          alert("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        } else {
          alert("Terjadi kesalahan saat mengambil data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  const exportToPDF = () => {
    if (!peminjaman || peminjaman.length === 0) {
      alert("Tidak ada data peminjaman untuk diexport.");
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape', // Format landscape untuk tabel yang lebar
      unit: 'mm'
    });

    // Tambahkan header
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`RIWAYAT PEMINJAMAN - ${member.nama.toUpperCase()}`, 14, 20);

    // Informasi member
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. KTP: ${member.no_ktp}`, 14, 30);
    doc.text(`Alamat: ${member.alamat}`, 14, 36);
    doc.text(`Terdaftar sejak: ${new Date(member.created_at).toLocaleDateString()}`, 14, 42);

    // Tambahkan tabel
    const tableColumn = [
      "ID", 
      "Nama Buku", 
      "Tanggal Pinjam", 
      "Tanggal Kembali", 
      "Status", 
      "Denda"
    ];
    
    const tableRows = peminjaman.map((item) => {
      const bukuItem = buku.find((b) => b.id === item.id_buku);
      const dendaItem = denda.find((d) => d.id_buku === item.id_buku);
      
      return [
        item.id,
        bukuItem ? bukuItem.judul : "Buku tidak ditemukan",
        new Date(item.tgl_pinjam).toLocaleDateString('id-ID'),
        item.tgl_pengembalian 
          ? new Date(item.tgl_pengembalian).toLocaleDateString('id-ID') 
          : "Belum dikembalikan",
        item.status_pengembalian === 0 ? "Dipinjam" : "Dikembalikan",
        dendaItem ? `Rp ${dendaItem.jumlah_denda.toLocaleString('id-ID')}` : "-"
      ];
    });

    // Style untuk tabel
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 50 }, // Nama Buku
        2: { cellWidth: 30 }, // Tanggal Pinjam
        3: { cellWidth: 30 }, // Tanggal Kembali
        4: { cellWidth: 25 }, // Status
        5: { cellWidth: 30 }  // Denda
      },
      didDrawPage: function (data) {
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 
          data.settings.margin.left, 
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Simpan file PDF
    doc.save(`Riwayat_Peminjaman_${member.nama.replace(/\s+/g, '_')}.pdf`);
  };

  // Hitung data yang akan ditampilkan berdasarkan halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeminjaman = peminjaman.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(peminjaman.length / itemsPerPage);

  const getUserName = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      return 'Pengguna'; // Fallback jika user tidak ditemukan
    }

    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.name || 'Pengguna'; // Fallback jika name tidak ada
    } catch (error) {
      console.error("Error parsing user data:", error);
      return 'Pengguna'; // Fallback jika parsing gagal
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Memuat data...</span>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="alert alert-danger text-center mt-5">
        Tidak dapat memuat data member.
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header Section */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-primary">Detail Member</h1>
            <p className="lead text-muted">Informasi lengkap anggota perpustakaan</p>
          </div>

          {/* Member Information Card */}
          <div className="card shadow-lg mb-5">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="bi bi-person-circle me-2"></i>
                {member.nama}
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-bold">No. KTP:</span>
                      <span className="text-muted">{member.no_ktp}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Alamat:</span>
                      <span className="text-muted text-end">{member.alamat}</span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Tanggal Lahir:</span>
                      <span className="text-muted">{new Date(member.tgl_lahir).toLocaleDateString('id-ID')}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Terdaftar Sejak:</span>
                      <span className="text-muted">{new Date(member.created_at).toLocaleDateString('id-ID')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-footer bg-light">
              <small className="text-muted">
                Terakhir diperbarui: {new Date(member.updated_at).toLocaleString('id-ID')}
              </small>
            </div>
          </div>

          {/* Peminjaman Section */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 fw-bold">
                <i className="bi bi-book me-2"></i>
                Riwayat Peminjaman
              </h2>
              <div>
                <span className="badge bg-primary rounded-pill me-3">
                  {peminjaman.length} total peminjaman
                </span>
                <button 
                  className="btn btn-success btn-sm" 
                  onClick={exportToPDF}
                  disabled={peminjaman.length === 0}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  Export PDF
                </button>
              </div>
            </div>

            {currentPeminjaman.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">ID Peminjaman</th>
                        <th scope="col">Nama Buku</th>
                        <th scope="col">Tanggal Pinjam</th>
                        <th scope="col">Tanggal Kembali</th>
                        <th scope="col">Status</th>
                        <th scope="col">Denda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPeminjaman.map((item) => {
                        const bukuItem = buku.find((b) => b.id === item.id_buku);
                        const dendaItem = denda.find((d) => d.id_buku === item.id_buku);
                        return (
                          <tr key={item.id}>
                            <td className="fw-semibold">#{item.id}</td>
                            <td>
                              {bukuItem ? (
                                <span className="fw-semibold">{bukuItem.judul}</span>
                              ) : (
                                <span className="text-danger">Buku tidak ditemukan (ID: {item.id_buku})</span>
                              )}
                            </td>
                            <td>{new Date(item.tgl_pinjam).toLocaleDateString('id-ID')}</td>
                            <td>
                              {item.tgl_pengembalian ? (
                                new Date(item.tgl_pengembalian).toLocaleDateString('id-ID')
                              ) : (
                                <span className="text-warning">Belum dikembalikan</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${item.status_pengembalian === 0 ? "bg-warning" : "bg-success"}`}>
                                {item.status_pengembalian === 0 ? "Dipinjam" : "Dikembalikan"}
                              </span>
                            </td>
                            <td>
                              {dendaItem ? (
                                <div>
                                  <span className="text-danger fw-bold">Rp {dendaItem.jumlah_denda.toLocaleString('id-ID')}</span>
                                  <div className="text-muted small">{dendaItem.jenis_denda}</div>
                                </div>
                              ) : (
                                <span className="text-success">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-book text-muted" style={{ fontSize: "3rem" }}></i>
                </div>
                <h5 className="text-muted">Tidak ada riwayat peminjaman</h5>
                <p className="text-muted small">Member ini belum pernah meminjam buku</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
