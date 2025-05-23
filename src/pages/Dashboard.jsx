import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = "http://45.64.100.26:88/perpus-api/public/api";

const Dashboard = forwardRef((props, ref) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBooks: 0,
    totalLendings: 0,
  });
  const [borrowingsData, setBorrowingsData] = useState([]);
  const [recentBorrowings, setRecentBorrowings] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk mendapatkan headers dengan token
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      throw new Error("Token tidak tersedia");
    }
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  };

  // Handle logout ketika token tidak valid
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Sesi Anda telah berakhir. Silakan login kembali.");
    navigate("/login");
  };

  // Fungsi untuk fetch data dengan autentikasi
  const fetchWithAuth = async (url) => {
    try {
      const response = await axios.get(url, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  // Fetch semua data yang diperlukan
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchStats(),
        fetchBorrowingData(),
        fetchRecentBorrowings(),
        fetchPopularBooks(),
      ]);
    } catch (error) {
      setError("Gagal memuat data dashboard. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics for total members, books, and lendings
  const fetchStats = async () => {
    try {
      const [membersResponse, booksResponse, lendingsResponse] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/member`),
        fetchWithAuth(`${BASE_URL}/buku`),
        fetchWithAuth(`${BASE_URL}/peminjaman`),
      ]);

      console.log("Members Response:", membersResponse);
      console.log("Books Response:", booksResponse);
      console.log("Lendings Response:", lendingsResponse);

      const membersData = Array.isArray(membersResponse) ? membersResponse : membersResponse.data || [];
      const booksData = Array.isArray(booksResponse) ? booksResponse : booksResponse.data || [];
      const lendingsData = Array.isArray(lendingsResponse) ? lendingsResponse : lendingsResponse.data || [];

      console.log("Members Data:", membersData);
      console.log("Books Data:", booksData);
      console.log("Lendings Data:", lendingsData);

      setStats({
        totalMembers: membersData.length,
        totalBooks: booksData.length,
        totalLendings: lendingsData.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  };

  // Fetch monthly borrowing data for the chart
  const fetchBorrowingData = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`);
      const allBorrowings = Array.isArray(response) ? response : response.data || [];

      const monthlyData = {};
      allBorrowings.forEach((borrowing) => {
        if (!borrowing.tanggal_peminjaman) return;

        const date = new Date(borrowing.tanggal_peminjaman);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: date.toLocaleString("id-ID", { month: "short" }),
            borrowings: 0,
          };
        }
        monthlyData[monthYear].borrowings++;
      });

      const result = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      setBorrowingsData(result);
    } catch (error) {
      console.error("Error fetching borrowings data:", error);
      throw error;
    }
  };

  // Fetch recent borrowings
  const fetchRecentBorrowings = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`);
      const allBorrowings = Array.isArray(response) ? response : response.data || [];

      const sortedBorrowings = [...allBorrowings]
        .filter((b) => b.tanggal_peminjaman)
        .sort((a, b) => new Date(b.tanggal_peminjaman) - new Date(a.tanggal_peminjaman))
        .slice(0, 5);

      setRecentBorrowings(sortedBorrowings);
    } catch (error) {
      console.error("Error fetching recent borrowings:", error);
      throw error;
    }
  };

  // Fetch popular books
  const fetchPopularBooks = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`);
      const allBorrowings = Array.isArray(response) ? response : response.data || [];

      const bookCounts = {};
      allBorrowings.forEach((borrowing) => {
        if (!borrowing.id_buku) return;

        if (!bookCounts[borrowing.id_buku]) {
          bookCounts[borrowing.id_buku] = {
            id: borrowing.id_buku,
            count: 0,
          };
        }
        bookCounts[borrowing.id_buku].count++;
      });

      const sortedBooks = Object.values(bookCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const booksWithDetails = await Promise.all(
        sortedBooks.map(async (book) => {
          try {
            const bookResponse = await fetchWithAuth(`${BASE_URL}/buku/${book.id}`);
            return {
              ...(bookResponse.data || bookResponse),
              borrowCount: book.count,
            };
          } catch (error) {
            console.error(`Error fetching book details for ID ${book.id}:`, error);
            return null;
          }
        })
      );

      setPopularBooks(booksWithDetails.filter((book) => book !== null));
    } catch (error) {
      console.error("Error fetching popular books:", error);
      throw error;
    }
  };

  // Fetch data saat halaman diakses
  useEffect(() => {
    fetchAllData();
  }, [location]);

  useImperativeHandle(ref, () => ({
    refreshStats: fetchAllData,
  }));

  return (
    <div className="dashboard-container bg-light">
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 fw-bold text-dark">
            <i className="bi bi-book me-2"></i>Dashboard Perpustakaan
          </h1>
        </div>

        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fs-5">Memuat data perpustakaan...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              {/* Total Members */}
              <div className="col-xl-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded text-center">
                          <i className="bi bi-people-fill fs-1 text-primary"></i>
                        </div>
                      </div>
                      <div className="col-9">
                        <h6 className="text-uppercase text-muted mb-2">Total Anggota</h6>
                        <h2 className="mb-0 fw-bold">
                          {stats.totalMembers > 0 ? stats.totalMembers : "Memuat..."}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Books */}
              <div className="col-xl-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded text-center">
                          <i className="bi bi-book-fill fs-1 text-success"></i>
                        </div>
                      </div>
                      <div className="col-9">
                        <h6 className="text-uppercase text-muted mb-2">Total Buku</h6>
                        <h2 className="mb-0 fw-bold">
                          {stats.totalBooks > 0 ? stats.totalBooks : "Memuat..."}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Lendings */}
              <div className="col-xl-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <div className="bg-warning bg-opacity-10 p-3 rounded text-center">
                          <i className="bi bi-journal-check fs-1 text-warning"></i>
                        </div>
                      </div>
                      <div className="col-9">
                        <h6 className="text-uppercase text-muted mb-2">Total Peminjaman</h6>
                        <h2 className="mb-0 fw-bold">
                          {stats.totalLendings > 0 ? stats.totalLendings : "Memuat..."}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-clock-history me-2 text-primary"></i>
                      Peminjaman Terakhir
                    </h5>
                  </div>
                  <div className="card-body">
                    {recentBorrowings.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {recentBorrowings.map((borrowing, index) => (
                          <div key={index} className="list-group-item border-0 px-0 py-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3">
                                <i className="bi bi-person-check text-primary fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  {borrowing.member?.nama || 'Member tidak ditemukan'} minjam "{borrowing.book?.judul || 'Buku tidak ditemukan'}"
                                </h6>
                                <p className="mb-0 small text-muted">
                                  Meminjam "{borrowing.book?.judul || 'Buku tidak ditemukan'}" pada {formatDate(borrowing.tanggal_peminjaman)} ({timeAgo(borrowing.tanggal_peminjaman)})
                                </p>
                                <small className="text-muted">
                                  {formatDate(borrowing.tanggal_peminjaman)} ({timeAgo(borrowing.tanggal_peminjaman)})
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-journal-x text-muted fs-1"></i>
                        <p className="mt-3">Tidak ada data peminjaman terakhir</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-bookmark-star me-2 text-warning"></i>
                      Buku Populer
                    </h5>
                  </div>
                  <div className="card-body">
                    {popularBooks.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-borderless mb-0">
                          <thead>
                            <tr>
                              <th scope="col">Judul Buku</th>
                              <th scope="col">Pengarang</th>
                              <th scope="col">Peminjaman</th>
                            </tr>
                          </thead>
                          <tbody>
                            {popularBooks.map((book, index) => (
                              <tr key={index}>
                                <td>{book.judul || '-'}</td>
                                <td>{book.pengarang || '-'}</td>
                                <td className="text-warning">
                                  <span className="badge bg-warning bg-opacity-10 text-warning">
                                    {book.borrowCount}x
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-book text-muted fs-1"></i>
                        <p className="mt-3">Tidak ada data buku populer</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default Dashboard;