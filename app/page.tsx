'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedKey('');

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, prefix: 'XFT' }),
      });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedKey(data.license.key);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Admin - Generate License
        </h1>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Admin Secret</label>
          <input 
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
            placeholder="Enter admin secret..."
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !secret}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 transition-all"
        >
          {loading ? 'Generating...' : 'Generate New Key'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {generatedKey && (
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
            <div className="text-sm text-cyan-400 mb-2">Successfully Generated:</div>
            <div className="font-mono text-xl text-white select-all bg-black/30 p-2 rounded">
              {generatedKey}
            </div>
            <div className="text-xs text-gray-400 mt-2">Send this key to your customer.</div>
          </div>
        )}
      </div>
    </div>
  );
}
