import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Attribute } from '../../types/attribute';

const AttributeList: React.FC = () => {
  const { data: session } = useSession();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAttribute, setNewAttribute] = useState({ name: '', dataType: '', categoryId: '', isRequired: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAttributes();
  }, [currentPage]);

  const fetchAttributes = async () => {
    try {
      const response = await fetch(`/api/attributes?page=${currentPage}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch attributes');
      }
      const data = await response.json();
      setAttributes(data.attributes);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Error fetching attributes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewAttribute({
      ...newAttribute,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttribute),
      });
      if (!response.ok) {
        throw new Error('Failed to create attribute');
      }
      const createdAttribute = await response.json();
      setAttributes([...attributes, createdAttribute]);
      setNewAttribute({ name: '', dataType: '', categoryId: '', isRequired: false });
    } catch (err) {
      setError('Error creating attribute');
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
      <h1 className="text-2xl font-bold mb-4">Attribute Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <h2 className="text-xl font-semibold mt-6 mb-2">Create New Attribute</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1">Attribute Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newAttribute.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="dataType" className="block mb-1">Data Type</label>
          <select
            id="dataType"
            name="dataType"
            value={newAttribute.dataType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Data Type</option>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="categoryId" className="block mb-1">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={newAttribute.categoryId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Category</option>
            {/* Add category options here */}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="isRequired" className="inline-flex items-center">
            <input
              type="checkbox"
              id="isRequired"
              name="isRequired"
              checked={newAttribute.isRequired}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">Is Required</span>
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Attribute
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-6 mb-2">Attribute List</h2>
      {attributes.length > 0 ? (
        <>
          <ul className="list-disc pl-5">
            {attributes.map((attribute) => (
              <li key={attribute.id}>
                <a href={`/attributes/${attribute.id}`} className="text-blue-600 hover:underline">
                  {attribute.name} ({attribute.dataType})
                </a>
              </li>
            ))}
          </ul>
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
        <p>No attributes found.</p>
      )}
    </Layout>
  );
};

export default AttributeList;
