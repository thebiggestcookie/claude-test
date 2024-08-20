import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { Category } from '../../types/category';
import { Attribute } from '../../types/attribute';

const ProductGeneration: React.FC = () => {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [inputProduct, setInputProduct] = useState('');
  const [generatedProducts, setGeneratedProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [mappedAttributes, setMappedAttributes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Error fetching categories');
      console.error(err);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      setSubcategories(data);
    } catch (err) {
      setError('Error fetching subcategories');
      console.error(err);
    }
  };

  const fetchAttributes = async (subcategoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${subcategoryId}/attributes`);
      if (!response.ok) {
        throw new Error('Failed to fetch attributes');
      }
      const data = await response.json();
      setAttributes(data);
    } catch (err) {
      setError('Error fetching attributes');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputProduct(e.target.value);
  };

  const handleGenerateProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputProduct }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate products');
      }
      const data = await response.json();
      setGeneratedProducts(data.products);
      setDebugInfo(JSON.stringify(data.debug, null, 2));
      setStep(2);
    } catch (err) {
      setError('Error generating products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (product: string) => {
    setSelectedProduct(product);
    setStep(3);
  };

  const handleCategorySelection = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    await fetchSubcategories(categoryId);
  };

  const handleSubcategorySelection = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    await fetchAttributes(subcategoryId);
  };

  const handleIdentifyCategory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products/identify-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product: selectedProduct, 
          categoryId: selectedCategory,
          subcategoryId: selectedSubcategory 
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to identify category');
      }
      const data = await response.json();
      setDebugInfo(JSON.stringify(data.debug, null, 2));
      setStep(4);
    } catch (err) {
      setError('Error identifying category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeMapping = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products/map-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product: selectedProduct, 
          subcategoryId: selectedSubcategory,
          attributes: attributes
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to map attributes');
      }
      const data = await response.json();
      setMappedAttributes(data.mappedAttributes);
      setDebugInfo(JSON.stringify(data.debug, null, 2));
      setStep(5);
    } catch (err) {
      setError('Error mapping attributes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProduct,
          categoryId: selectedCategory,
          subcategoryId: selectedSubcategory,
          attributes: mappedAttributes,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      setStep(6);
    } catch (err) {
      setError('Error saving product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Layout>
        <p>Please sign in to access this page.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Product Generation</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 1: Enter Product Information</h2>
          <input
            type="text"
            value={inputProduct}
            onChange={handleInputChange}
            placeholder="Enter product name or type"
            className="w-full px-3 py-2 border rounded mb-4"
          />
          <button
            onClick={handleGenerateProducts}
            disabled={loading || !inputProduct.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate Products'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 2: Select a Product</h2>
          <ul className="space-y-2">
            {generatedProducts.map((product, index) => (
              <li key={index}>
                <button
                  onClick={() => handleProductSelection(product)}
                  className="w-full text-left px-4 py-2 border rounded hover:bg-gray-100"
                >
                  {product}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 3: Select Category and Subcategory</h2>
          <p className="mb-4">Selected Product: {selectedProduct}</p>
          <select
            value={selectedCategory}
            onChange={handleCategorySelection}
            className="w-full px-3 py-2 border rounded mb-4"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <select
              value={selectedSubcategory}
              onChange={handleSubcategorySelection}
              className="w-full px-3 py-2 border rounded mb-4"
            >
              <option value="">Select a subcategory</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleIdentifyCategory}
            disabled={loading || !selectedSubcategory}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Confirm Category'}
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 4: Map Attributes</h2>
          <p className="mb-4">Selected Product: {selectedProduct}</p>
          <p className="mb-4">Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}</p>
          <p className="mb-4">Subcategory: {subcategories.find(s => s.id.toString() === selectedSubcategory)?.name}</p>
          <button
            onClick={handleAttributeMapping}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Mapping...' : 'Map Attributes'}
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Step 5: Review and Save</h2>
          <p className="mb-4">Selected Product: {selectedProduct}</p>
          <p className="mb-4">Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}</p>
          <p className="mb-4">Subcategory: {subcategories.find(s => s.id.toString() === selectedSubcategory)?.name}</p>
          <h3 className="text-lg font-semibold mb-2">Mapped Attributes:</h3>
          <ul className="mb-4">
            {Object.entries(mappedAttributes).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <button
            onClick={handleSaveProduct}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Product Generation Complete</h2>
          <p>The product has been generated, categorized, and saved successfully.</p>
          <button
            onClick={() => setStep(1)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Generate Another Product
          </button>
        </div>
      )}

      {debugInfo && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {debugInfo}
          </pre>
        </div>
      )}
    </Layout>
  );
};

export default ProductGeneration;
