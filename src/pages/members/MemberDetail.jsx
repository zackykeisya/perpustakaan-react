import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MemberDetail() {
  const [member, setMember] = useState(null);
  const [peminjaman, setPeminjaman] = useState([]);
  const [denda, setDenda] = useState([]);
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.log("Fetching buku data from:", `http://45.64.100.26:88/perpus-api/public/api/buku`);
        const bukuRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/buku`, { headers });
        console.log("Data Buku dari API:", bukuRes.data);
        setBuku(bukuRes.data.data);

        // Fetch data member
        const memberRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/member/${id}`, { headers });
        setMember(memberRes.data);

        // Fetch data peminjaman
        console.log("Fetching peminjaman data from:", `http://45.64.100.26:88/perpus-api/public/api/peminjaman/${id}`);
        const peminjamanRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/peminjaman/${id}`, { headers });
        console.log("Data Peminjaman dari API:", peminjamanRes.data);
        setPeminjaman(peminjamanRes.data.data);

        // Fetch data denda
        console.log("Fetching denda data from:", `http://45.64.100.26:88/perpus-api/public/api/denda/${id}`);
        const dendaRes = await axios.get(`http://45.64.100.26:88/perpus-api/public/api/denda/${id}`, { headers });
        console.log("Data Denda dari API:", dendaRes.data);
        setDenda(dendaRes.data.data);
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

    const doc = new jsPDF();

    // Tambahkan judul
    doc.setFontSize(16);
    doc.text(`Riwayat Peminjaman - ${member.nama}`, 14, 20);

    // Tambahkan tabel
    const tableColumn = ["ID Peminjaman", "ID Buku", "Tanggal Pinjam", "Tanggal Kembali", "Status", "Denda"];
    const tableRows = [];

    peminjaman.forEach((item) => {
      const dendaItem = denda.find((d) => d.id_buku === item.id_buku);
      const rowData = [
        `#${item.id}`,
        `B-${item.id_buku}`,
        new Date(item.tgl_pinjam).toLocaleDateString(),
        item.tgl_pengembalian ? new Date(item.tgl_pengembalian).toLocaleDateString() : "Belum dikembalikan",
        item.status_pengembalian === 0 ? "Dipinjam" : "Dikembalikan",
        dendaItem ? `Rp ${dendaItem.jumlah_denda.toLocaleString()}` : "-",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    // Simpan file PDF
    doc.save(`Riwayat_Peminjaman_${member.nama}.pdf`);
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
                      <span className="text-muted">{new Date(member.tgl_lahir).toLocaleDateString()}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Terdaftar Sejak:</span>
                      <span className="text-muted">{new Date(member.created_at).toLocaleDateString()}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-footer bg-light">
              <small className="text-muted">
                Terakhir diperbarui: {new Date(member.updated_at).toLocaleString()}
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
                <button className="btn btn-success btn-sm" onClick={exportToPDF}>
                  Export PDF
                </button>
              </div>
            </div>

            {peminjaman.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">ID Peminjaman</th>
                      <th scope="col">ID Buku</th>
                      <th scope="col">Tanggal Pinjam</th>
                      <th scope="col">Tanggal Kembali</th>
                      <th scope="col">Status</th>
                      <th scope="col">Denda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peminjaman.map((item) => {
                      const dendaItem = denda.find((d) => d.id_buku === item.id_buku);
                      return (
                        <tr key={item.id}>
                          <td className="fw-semibold">#{item.id}</td>
                          <td>B-{item.id_buku}</td>
                          <td>{new Date(item.tgl_pinjam).toLocaleDateString()}</td>
                          <td>
                            {item.tgl_pengembalian ? (
                              new Date(item.tgl_pengembalian).toLocaleDateString()
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
                                <span className="text-danger fw-bold">Rp {dendaItem.jumlah_denda.toLocaleString()}</span>
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