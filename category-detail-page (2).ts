import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Category } from '../../types/category';
import { validateCategoryForm, ValidationErrors } from '../../utils/categoryValidation';

const CategoryDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    parentCategoryId: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      setCategory(data);
      setFormData({
        name: data.name,
        departmentId: data.departmentId.toString(),
        parentCategoryId: data.parentCategoryId ? data.parentCategoryId.toString() : '',
      });
    } catch (err) {
      setError('Error fetching category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCategoryForm(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error('Failed to update category');
        }
        const updatedCategory = await response.json();
        setCategory(updatedCategory);
        setEditMode(false);
      } catch (err) {
        setError('Error updating category');
        console.error(err);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete category');
        }
        router.push('/categories');
      } catch (err) {
        setError('Error deleting category');
        console.error(err);
      }
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <Layout>
        <p>You don't have permission to view this page.</p>
      </Layout>
    );
  }

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;
  if (!category) return <Layout><p>Category not found</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Category Details</h1>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {/* Add department options here */}
            </select>
            {validationErrors.departmentId && <p className="text-red-500">{validationErrors.departmentId}</p>}
          </div>
          <div>
            <label htmlFor="parentCategoryId" className="block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              id="parentCategoryId"
              name="parentCategoryId"
              value={formData.parentCategoryId}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">None</option>
              {/* Add parent category options here */}
            </select>
            {validationErrors.parentCategoryId && <p className="text-red-500">{validationErrors.parentCategoryId}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Display mode remains the same */
        <div>{/* ... */}</div>
      )}
    </Layout>
  );
};

export default CategoryDetail;
