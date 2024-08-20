import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { queryLLM } from '../../utils/llmQuery';

const LLMTest: React.FC = () => {
  const { data: session } = useSession();
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/llm/providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      setError('Error fetching providers');
    }
  };

  const fetchModels = async (providerId) => {
    try {
      const response = await fetch(`/api/llm/models?providerId=${providerId}`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      setError('Error fetching models');
    }
  };

  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
    fetchModels(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await queryLLM({
        providerId: parseInt(selectedProvider),
        modelId: parseInt(selectedModel),
        prompt,
      });
      setResponse(result);
    } catch (error) {
      setError('Error querying LLM');
    }
    setLoading(false);
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
      <h1 className="text-2xl font-bold mb-4">LLM Test Interface</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="provider" className="block mb-1">Provider</label>
          <select
            id="provider"
            value={selectedProvider}
            onChange={handleProviderChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="model" className="block mb-1">Model</label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prompt" className="block mb-1">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {loading ? 'Querying...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </Layout>
  );
};

export default LLMTest;
