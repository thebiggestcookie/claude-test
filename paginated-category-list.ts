import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Category } from '../../types/category';

const CategoryList: React.FC = () => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', departmentId: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?page=${currentPage}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Error fetching categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setNewCategory({ name: '', departmentId: '' });
    } catch (err) {
      setError('Error creating category');
      console.error(err);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <Layout>
        <p>You don't have permission to view this page.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Form for creating new category */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Create New Category</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        {/* ... (form fields remain the same) ... */}
      </form>

      {/* Category list */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Category List</h2>
      {categories.length > 0 ? (
        <>
          <ul className="list-disc pl-5">
            {categories.map((category) => (
              <li key={category.id}>
                <a href={`/categories/${category.id}`} className="text-blue-600 hover:underline">
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
          {/* Pagination controls */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No categories found.</p>
      )}
    </Layout>
  );
};

export default CategoryList;
