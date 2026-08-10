'use client';

import { useState, useEffect } from 'react';

type License = {
  id: string;
  key: string;
  hwid: string | null;
  createdAt: string;
  isBanned: boolean;
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dashboard state
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-fetch if secret was entered before
  useEffect(() => {
    const savedSecret = localStorage.getItem('adminSecret');
    if (savedSecret) {
      setSecret(savedSecret);
      fetchLicenses(savedSecret);
    }
  }, []);

  const fetchLicenses = async (currentSecret: string) => {
    setLoadingLicenses(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: currentSecret }),
      });
      const data = await res.json();
      
      if (data.success) {
        setLicenses(data.licenses);
        setIsAuthenticated(true);
        setError('');
        localStorage.setItem('adminSecret', currentSecret);
      } else {
        setIsAuthenticated(false);
        if (data.error === 'Unauthorized') {
           localStorage.removeItem('adminSecret');
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingLicenses(false);
  };

  const handleLogin = () => {
    fetchLicenses(secret);
  };

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
        // Refresh the table
        fetchLicenses(secret);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch');
    }
    setLoading(false);
  };

  const toggleBan = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, id, isBanned: !currentStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Update local state
        setLicenses(prev => prev.map(l => l.id === id ? { ...l, isBanned: !currentStatus } : l));
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <div className="mb-4">
            <input 
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter admin secret..."
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button 
            onClick={handleLogin}
            disabled={loadingLicenses || !secret}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loadingLicenses ? 'Checking...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <button 
            onClick={() => {
              localStorage.removeItem('adminSecret');
              setIsAuthenticated(false);
              setSecret('');
            }}
            className="text-gray-400 hover:text-white transition-colors text-sm underline"
          >
            Logout
          </button>
        </div>

        {/* Generate Key Section */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {loading ? 'Generating...' : '+ Generate New Key'}
          </button>

          {generatedKey && (
            <div className="flex-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 flex justify-between items-center w-full">
              <span className="font-mono text-cyan-400 select-all font-bold tracking-wider">{generatedKey}</span>
              <span className="text-xs text-gray-400">Newly Generated</span>
            </div>
          )}
          
          {error && <span className="text-red-400 text-sm ml-4">{error}</span>}
        </div>

        {/* Licenses Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Licenses</h2>
            <button onClick={() => fetchLicenses(secret)} className="text-sm text-cyan-500 hover:text-cyan-400">
              ↻ Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-950/50 text-gray-400 uppercase font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">License Key</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Linked PC (HWID)</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {licenses.map((license) => (
                  <tr key={license.id} className={`hover:bg-gray-800/50 transition-colors ${license.isBanned ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 font-mono text-cyan-100 select-all">
                      {license.key}
                    </td>
                    <td className="px-6 py-4">
                      {license.isBanned ? (
                        <span className="inline-block px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">BANNED</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">ACTIVE</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs max-w-[150px] sm:max-w-[250px] md:max-w-[300px] truncate" title={license.hwid || 'Unclaimed'}>
                      {license.hwid ? license.hwid : <span className="italic text-gray-600">Unclaimed</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(license.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleBan(license.id, license.isBanned)}
                        className={`px-4 py-1.5 rounded font-semibold text-xs transition-colors ${
                          license.isBanned 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                        }`}
                      >
                        {license.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
                {licenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No licenses found. Generate one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
