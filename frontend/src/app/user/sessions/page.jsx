'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${apiUrl}/code/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.sessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/code/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete session');
      }

      // Refresh sessions list
      fetchSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err.message || 'Failed to delete session');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Your Sessions</h1>
          <Link
            href="/user/code-generator"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            New Session
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No sessions found</p>
            <Link
              href="/user/code-generator"
              className="text-purple-400 hover:text-purple-300"
            >
              Create your first session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-[#1a1a1d] p-6 rounded-2xl border border-[#2a2a2e] hover:border-purple-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{session.name}</h2>
                    <p className="text-sm text-gray-400">
                      Framework: {session.framework}
                    </p>
                    <p className="text-sm text-gray-400">
                      Created: {formatDate(session.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
                <Link
                  href={`/user/code-generator?session=${session._id}`}
                  className="block w-full bg-purple-600 text-white text-center px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                >
                  Open Session
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage; 