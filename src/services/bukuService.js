import axios from 'axios';

const API_URL = 'http://45.64.100.26:88/perpus-api/public/api/buku';  // URL API buku

// Fungsi untuk mendapatkan semua data buku
const getAllBooks = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan detail buku berdasarkan ID
const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menambah buku baru
const addBook = async (bookData) => {
  try {
    const response = await axios.post(API_URL, bookData);
    return response.data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

// Fungsi untuk memperbarui data buku
const updateBook = async (id, bookData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, bookData);
    return response.data;
  } catch (error) {
    console.error(`Error updating book with id ${id}:`, error);
    throw error;
  }
};

// Fungsi untuk menghapus buku berdasarkan ID
const deleteBook = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting book with id ${id}:`, error);
    throw error;
  }
};

export default {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
};
