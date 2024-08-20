import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Product } from '../../types/product';

const HumanGraderInterface: React.FC = () => {
  const { data: session } = useSession();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingStats, setGradingStats] = useState({ reviewed: 0, accuracy: 100 });

  useEffect(() => {
    fetchNextProduct();
  }, []);

  const fetchNextProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/grading/next-product');
      if (!response.ok) {
        throw new Error('Failed to fetch next product');
      }
      const data = await response.json();
      setCurrentProduct(data);
    } catch (err) {
      setError('Error fetching next product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attributeId: number, value: string) => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        attributes: currentProduct.attributes.map(attr =>
          attr.id === attributeId ? { ...attr, value } : attr
        ),
      });
    }
  };

  const handleSubmit = async (approved: boolean) => {
    if (!currentProduct) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/grading/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          attributes: currentProduct.attributes,
          approved,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit grading');
      }
      const data = await response.json();
      setGradingStats(data.stats);
      fetchNextProduct();
    } catch (err) {
      setError('Error submitting grading');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'HUMAN_GRADER') {
    return (
      <Layout>
        <p>You don't have permission to access this page.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Human Grader Interface</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <p>Products Reviewed: {gradingStats.reviewed}</p>
        <p>Accuracy: {gradingStats.accuracy.toFixed(2)}%</p>
      </div>

      {loading ? (
        <p>Loading next product...</p>
      ) : currentProduct ? (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-2">{currentProduct.name}</h2>
          <p className="mb-4">Category: {currentProduct.category.name}</p>
          
          <h3 className="text-lg font-semibold mb-2">Attributes:</h3>
          {currentProduct.attributes.map(attr => (
            <div key={attr.id} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`attr-${attr.id}`}>
                {attr.name}
              </label>
              <input
                id={`attr-${attr.id}`}
                type="text"
                value={attr.value}
                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleSubmit(false)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Reject
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Approve
            </button>
          </div>
        </div>
      ) : (
        <p>No more products to grade at this time.</p>
      )}
    </Layout>
  );
};

export default HumanGraderInterface;
