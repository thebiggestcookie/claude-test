import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Attribute } from '../../types/attribute';

const AttributeDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dataType: '',
    categoryId: '',
    isRequired: false,
  });

  useEffect(() => {
    if (id) {
      fetchAttribute();
    }
  }, [id]);

  const fetchAttribute = async () => {
    try {
      const response = await fetch(`/api/attributes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attribute');
      }
      const data = await response.json();
      setAttribute(data);
      setFormData({
        name: data.name,
        dataType: data.dataType,
        categoryId: data.categoryId.toString(),
        isRequired: data.isRequired,
      });
    } catch (err) {
      setError('Error fetching attribute');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/attributes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to update attribute');
      }
      const updatedAttribute = await response.json();
      setAttribute(updatedAttribute);
      setEditMode(false);
    } catch (err) {
      setError('Error updating attribute');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this attribute?')) {
      try {
        const response = await fetch(`/api/attributes/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete attribute');
        }
        router.push('/attributes');
      } catch (err) {
        setError('Error deleting attribute');
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
  if (!attribute) return <Layout><p>Attribute not found</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Attribute Details</h1>
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
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">Data Type</label>
            <select
              id="dataType"
              name="dataType"
              value={formData.dataType}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {/* Add category options here */}
            </select>
          </div>
          <div>
            <label htmlFor="isRequired" className="inline-flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Is Required</span>
            </label>
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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Attribute Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attribute.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Data Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attribute.dataType}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attribute.category.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Is Required</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{attribute.isRequired ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              Edit Attribute
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Attribute
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttributeDetail;
