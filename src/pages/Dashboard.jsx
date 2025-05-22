import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://45.64.100.26:88/perpus-api/public/api";

const Dashboard = forwardRef((props, ref) => {
  const [stats, setStats] = useState({
    totalMembers: 120,
    totalBooks: 450,
    totalLendings: 320,
  });
  const [borrowingsData, setBorrowingsData] = useState([
    { month: 'Jan', borrowings: 20 },
    { month: 'Feb', borrowings: 35 },
    { month: 'Mar', borrowings: 50 },
    { month: 'Apr', borrowings: 40 },
    { month: 'Mei', borrowings: 60 },
    { month: 'Jun', borrowings: 30 },
  ]);
  const [recentBorrowings, setRecentBorrowings] = useState([
    {
      id: 1,
      member: { nama: 'John Doe' },
      book: { judul: 'React for Beginners' },
      tanggal_peminjaman: '2025-05-20',
    },
    {
      id: 2,
      member: { nama: 'Jane Smith' },
      book: { judul: 'Advanced JavaScript' },
      tanggal_peminjaman: '2025-05-18',
    },
  ]);
  const [popularBooks, setPopularBooks] = useState([
    { judul: 'React for Beginners', pengarang: 'John Doe', borrowCount: 15 },
    { judul: 'Advanced JavaScript', pengarang: 'Jane Smith', borrowCount: 12 },
    { judul: 'CSS Mastery', pengarang: 'Chris Coyier', borrowCount: 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentBorrowingsPage, setRecentBorrowingsPage] = useState(1);
  const [popularBooksPage, setPopularBooksPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Fungsi untuk mendapatkan headers dengan token terbaru
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
    navigate("/login");
    alert("Sesi Anda telah berakhir. Silakan login kembali.");
  };

  // Format tanggal Indonesia
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format waktu relatif
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} tahun lalu`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} bulan lalu`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} hari lalu`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} jam lalu`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} menit lalu`;
    
    return "Baru saja";
  };

  // Fungsi untuk fetch data dengan retry dan penanganan error
  const fetchWithAuth = async (url, options = {}, retries = 3) => {
    try {
      const response = await axios.get(url, {
        ...options,
        headers: getHeaders()
      });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleLogout();
        throw error;
      }
      
      if (retries > 0) {
        console.warn(`Retrying... (${3 - retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithAuth(url, options, retries - 1);
      }
      
      throw error;
    }
  };

  // Fetch statistics for total members, books, and lendings
  const fetchStats = async () => {
    try {
      const [membersResponse, booksResponse, lendingsResponse] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/member`),
        fetchWithAuth(`${BASE_URL}/buku`),
        fetchWithAuth(`${BASE_URL}/peminjaman`)
      ]);

      setStats({
        totalMembers: membersResponse.data.data?.length || 0,
        totalBooks: booksResponse.data.data?.length || 0,
        totalLendings: lendingsResponse.data.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Gagal memuat data statistik. Silakan coba lagi.");
    }
  };

  // Fetch monthly borrowing data for the chart
  const fetchBorrowingData = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`);
      const allBorrowings = response.data.data || [];

      // Group by month
      const monthlyData = {};
      allBorrowings.forEach(borrowing => {
        const date = new Date(borrowing.tanggal_peminjaman);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: date.toLocaleString('id-ID', { month: 'short' }),
            borrowings: 0
          };
        }
        monthlyData[monthYear].borrowings++;
      });

      // Convert to array and sort by month
      const result = Object.values(monthlyData)
        .sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

      setBorrowingsData(result);
    } catch (error) {
      console.error("Error fetching borrowings data:", error);
      setError("Gagal memuat data grafik peminjaman. Silakan coba lagi.");
    }
  };

  // Fetch recent borrowings
  const fetchRecentBorrowings = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`, {
        params: {
          sort: 'tanggal_peminjaman:desc',
          limit: 5
        }
      });
      
      const borrowings = response.data.data || [];
      const borrowingsWithDetails = await Promise.all(
        borrowings.map(async (borrowing) => {
          try {
            const [memberResponse, bookResponse] = await Promise.all([
              fetchWithAuth(`${BASE_URL}/member/${borrowing.id_member}`),
              fetchWithAuth(`${BASE_URL}/buku/${borrowing.id_buku}`)
            ]);
            
            return {
              ...borrowing,
              member: memberResponse.data.data || null,
              book: bookResponse.data.data || null
            };
          } catch (error) {
            console.error("Error fetching details:", error);
            return borrowing;
          }
        })
      );

      setRecentBorrowings(borrowingsWithDetails);
    } catch (error) {
      console.error("Error fetching recent borrowings:", error);
      setError("Gagal memuat data peminjaman terakhir.");
    }
  };

  // Fetch popular books
  const fetchPopularBooks = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/peminjaman`);
      const allBorrowings = response.data.data || [];

      const bookCounts = {};
      allBorrowings.forEach(borrowing => {
        if (!bookCounts[borrowing.id_buku]) {
          bookCounts[borrowing.id_buku] = {
            id: borrowing.id_buku,
            count: 0
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
              ...bookResponse.data.data,
              borrowCount: book.count
            };
          } catch (error) {
            console.error("Error fetching book details:", error);
            return null;
          }
        })
      );

      setPopularBooks(booksWithDetails.filter(book => book !== null));
    } catch (error) {
      console.error("Error fetching popular books:", error);
      setError("Gagal memuat data buku populer. Silakan coba lagi.");
    }
  };

  // Handle page change for recent borrowings
  const handlePageChange = (type, direction) => {
    if (type === "recentBorrowings") {
      setRecentBorrowingsPage((prevPage) => prevPage + direction);
    } else if (type === "popularBooks") {
      setPopularBooksPage((prevPage) => prevPage + direction);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchStats(),
      fetchBorrowingData(),
      fetchRecentBorrowings(),
      fetchPopularBooks()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    refreshStats: () => {
      console.log("Refreshing stats...");
    },
  }));

  // Paginate recent borrowings and popular books
  const currentRecentBorrowings = recentBorrowings.slice(
    (recentBorrowingsPage - 1) * itemsPerPage,
    recentBorrowingsPage * itemsPerPage
  );

  const currentPopularBooks = popularBooks.slice(
    (popularBooksPage - 1) * itemsPerPage,
    popularBooksPage * itemsPerPage
  );

  return (
    <div className="dashboard-container bg-light">
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 fw-bold text-dark">
            <i className="bi bi-book me-2"></i>Dashboard Perpustakaan
          </h1>
          <div className="bg-white p-2 rounded shadow-sm">
            <span className="text-muted small">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center my-5 py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: '3rem', height: '3rem' }}
              role="status"
            >
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
                        <h2 className="mb-0 fw-bold">{stats.totalMembers}</h2>
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
                        <h2 className="mb-0 fw-bold">{stats.totalBooks}</h2>
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
                        <h2 className="mb-0 fw-bold">{stats.totalLendings}</h2>
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
                    {currentRecentBorrowings.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {currentRecentBorrowings.map((borrowing, index) => (
                          <div key={index} className="list-group-item border-0 px-0 py-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3">
                                <i className="bi bi-person-check text-primary fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  {borrowing.member?.nama || 'Member tidak ditemukan'}
                                </h6>
                                <p className="mb-0 small text-muted">
                                  Meminjam "{borrowing.book?.judul || 'Buku tidak ditemukan'}"
                                </p>
                                <small className="text-muted">
                                  {borrowing.tanggal_peminjaman}
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
                    {currentPopularBooks.length > 0 ? (
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
                            {currentPopularBooks.map((book, index) => (
                              <tr key={index}>
                                <td>{book.judul}</td>
                                <td>{book.pengarang}</td>
                                <td>
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