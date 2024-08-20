import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Product } from '../../types/product';

const ProductList: React.FC = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error fetching products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Layout>
        <p>Please sign in to view this page.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="mb-4">
        <a href="/products/create" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create New Product
        </a>
      </div>

      {products.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {product.category.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <a href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-2">
                    View
                  </a>
                  <a href={`/products/${product.id}/edit`} className="text-green-600 hover:text-green-900">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found.</p>
      )}
    </Layout>
  );
};

export default ProductList;
