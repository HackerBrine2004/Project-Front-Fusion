"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Plus, Eye, Trash2, Loader2 } from "lucide-react";

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/code/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        setSessions(response.data.sessions);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          router.push("/auth/login");
          return;
        }
        throw new Error(
          error.response?.data?.error || "Failed to fetch sessions"
        );
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${apiUrl}/code/save-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Session " + new Date().toLocaleString(),
          files: {},
          framework: "tailwind",
          prompt: "",
          activeFile: "",
          hasGenerated: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session");
      }
      router.push(`/user/code-generator/${data.session._id}`);
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/code/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete session");
      }

      // Refresh sessions list
      fetchSessions();
    } catch (err) {
      console.error("Error deleting session:", err);
      setError(err.message || "Failed to delete session");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFrameworkIcon = (framework) => {
    switch (framework) {
      case "tailwind":
        return "🎨";
      case "react":
        return "⚛";
      case "both":
        return "🎨⚛";
      default:
        return "📝";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-12 text-violet-400 animate-spin" />
          <p className="text-gray-400">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-28 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(138,43,226,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 animate-gradient bg-300%">
              Your Sessions
            </h1>
            <p className="text-gray-400">
              Manage and access your saved UI designs
            </p>
          </div>
          <button
            onClick={createNewSession}
            disabled={loading}
            className="relative py-3 px-6 rounded-lg bg-gradient-to-r from-violet-600/90 to-blue-600/90 text-white hover:from-violet-500 hover:to-blue-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 shadow-[0_0_10px_rgba(138,43,226,0.3)] flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="size-5 mr-2 animate-spin" />
            ) : (
              <Plus className="size-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            )}
            New Session
            <span className="absolute -bottom-1 -left-1 -right-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8 flex items-center backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-black/50 rounded-2xl border border-violet-500/30 backdrop-blur-sm shadow-[0_4px_30px_rgba(138,43,226,0.2)]">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-gray-400 mb-6 text-lg">No sessions found</p>
            <button
              onClick={createNewSession}
              disabled={loading}
              className="relative py-2 px-6 rounded-lg bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white hover:from-violet-500 hover:to-blue-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 inline-flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="size-5 mr-2 animate-spin" />
              ) : (
                <Plus className="size-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              )}
              Create your first session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-black/50 p-6 rounded-2xl border border-violet-500/30 hover:border-cyan-400 transition-all duration-300 group backdrop-blur-sm shadow-[0_4px_30px_rgba(138,43,226,0.1)] hover:shadow-[0_4px_30px_rgba(138,43,226,0.3)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">
                        {getFrameworkIcon(session.framework)}
                      </span>
                      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                        {session.name}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-violet-400 mr-2"></span>
                        Framework: {session.framework}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
                        Created: {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
                <Link
                  href={`/user/code-generator/${session._id}`}
                  className="relative w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white hover:from-violet-500 hover:to-blue-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 group overflow-hidden"
                >
                  <Eye className="size-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Open Session</span>
                  <span className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-r from-cyan-500/50 to-violet-500/50 group-hover:h-full transition-all duration-300 ease-in-out -z-0"></span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
        
        .bg-300\\% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  );
};

export default SessionsPage;