'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { tsParticles } from 'tsparticles-engine';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

const extractCode = (text) => {
  try {
    const codeBlockMatch = text.match(/```(?:html|jsx|tsx)?\n([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();

    return text
      .split('\n')
      .filter(line => !line.trim().match(/^(\*|#|```|key improvements)/i))
      .join('\n')
      .trim();
  } catch (error) {
    console.error("Error extracting code:", error);
    return text;
  }
};

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('tailwind');
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({ generate: false, modify: false, save: false, load: false, update: false });
  const [maximizedPanel, setMaximizedPanel] = useState(null);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const router = useRouter();
  // const searchParams = useSearchParams();
  const {id} = useParams();

  

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Auto-scroll preview when code changes
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
    }
  }, [files, activeFile]);

  // Initialize state from localStorage on client side
  useEffect(() => {
    const savedFiles = localStorage.getItem('generatedFiles');
    const savedActiveFile = localStorage.getItem('activeFile');
    const savedHasGenerated = localStorage.getItem('hasGenerated');

    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
    if (savedActiveFile) {
      setActiveFile(savedActiveFile);
    }
    if (savedHasGenerated === 'true') {
      setHasGenerated(true);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('generatedFiles', JSON.stringify(files));
      localStorage.setItem('activeFile', activeFile);
      localStorage.setItem('hasGenerated', hasGenerated.toString());
    }
  }, [files, activeFile, hasGenerated]);

  // Load session data if session ID is provided
  useEffect(() => {

    if (!id) {
      console.error('No session ID found in params');
      return;
    }

    setSessionId(id);
    loadSession(id);
  }, [id]);

  const loadSession = async (sessionId) => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    setLoading(prev => ({ ...prev, load: true }));
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${apiUrl}/code/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to load session');
      }

      if (!data.session) {
        throw new Error('Session data not found');
      }

      const session = data.session;
      setPrompt(session.prompt || '');
      setFramework(session.framework || 'tailwind');
      setFiles(session.files || {});
      setActiveFile(session.activeFile || Object.keys(session.files || {})[0] || '');
      setHasGenerated(session.hasGenerated || false);
      setSessionName(session.name || '');

      // Update URL to remove session ID
      // router.replace('/user/code-generator');
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(prev => ({ ...prev, load: false }));
    }
  };

  const handleGenerate = async () => {
    setHasGenerated(true);
    setError('');
    setFiles({});
    setActiveFile('');
    setLoading({ ...loading, generate: true });

    try {
      const finalPrompt = prompt.trim()
        ? `${prompt} using ${framework === 'both' ? 'React and Tailwind CSS' : framework}`
        : 'Create a basic responsive UI using Tailwind CSS';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code/generate-ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(text.startsWith('<') ? 'Server error occurred' : text);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      const cleanedResult = extractCode(data.result || 'No code generated.');
      const fileData = data.files || { 'index.html': cleanedResult };

      // Add necessary React files if framework is React
      if (framework === 'react' || framework === 'both') {
        const reactFiles = {
          'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
          'src/App.jsx': cleanedResult,
          'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
          'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}`,
          'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated UI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
          'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          'package.json': `{
  "name": "generated-ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}`
        };
        setFiles(prev => ({ ...prev, ...reactFiles }));
      } else {
        setFiles(fileData);
      }

      setActiveFile(Object.keys(fileData)[0] || '');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message.includes('<!DOCTYPE') ? 'Server error occurred' : err.message);
      console.error("Generation error:", err);
    } finally {
      setLoading({ ...loading, generate: false });
    }
  };

  const handleModifyCode = async () => {
    if (!activeFile || !files[activeFile]) {
      setError('Please select a file to modify');
      return;
    }

    if (!modificationPrompt.trim()) {
      setError('Please enter modification instructions');
      return;
    }

    setError('');
    setLoading({ ...loading, modify: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code/modify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: files[activeFile],
          instructions: modificationPrompt.trim(),
          framework: framework
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(text.startsWith('<') ? 'Server error occurred' : text);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify code');
      }

      const modifiedCode = extractCode(data.result || 'No modified code generated.');
      setFiles(prev => ({ ...prev, [activeFile]: modifiedCode }));
      setModificationPrompt('');
    } catch (err) {
      setError(err.message.includes('<!DOCTYPE') ? 'Server error occurred' : err.message);
      console.error("Modification error:", err);
    } finally {
      setLoading({ ...loading, modify: false });
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['.html', '.js', '.jsx', '.tsx', '.css'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setError('Please upload a valid file type (HTML, JS, JSX, TSX, CSS)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFiles({ [file.name]: event.target.result });
      setActiveFile(file.name);
      setError('');
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (!activeFile) return;

    try {
      await navigator.clipboard.writeText(files[activeFile]);
      const copyButton = document.querySelector('.copy-button');
      if (copyButton) {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      setError('Failed to copy code');
      console.error("Copy error:", err);
    }
  };

  const handleFileChange = (fileName, content) => {
    if (!fileName || !content) return;
    setFiles(prev => ({ ...prev, [fileName]: content }));
  };

  const handleDownloadFile = (fileName) => {
    try {
      if (!files[fileName]) return;

      const blob = new Blob([files[fileName]], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
      console.error("Download error:", err);
    }
  };

  const handleDownloadAll = () => {
    try {
      const zip = require('jszip')();
      Object.keys(files).forEach((fileName) => {
        zip.file(fileName, files[fileName]);
      });
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-ui.zip';
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      setError('Failed to create zip file');
      console.error("Zip error:", err);
    }
  };

  const toggleMaximize = (panel) => {
    setMaximizedPanel(prev => prev === panel ? null : panel);
  };

  // Add a clear button to reset the state
  const handleClear = () => {
    setFiles({});
    setActiveFile('');
    setHasGenerated(false);
    setPrompt('');
    setModificationPrompt('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('generatedFiles');
      localStorage.removeItem('activeFile');
      localStorage.removeItem('hasGenerated');
    }
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      setError('Please enter a session name');
      return;
    }

    setLoading(prev => ({ ...prev, save: true }));
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to save sessions');
        router.push('/auth/login');
        return;
      }

      console.log('Saving session with data:', {
        name: sessionName.trim(),
        files,
        framework,
        prompt,
        activeFile,
        hasGenerated
      });

      const response = await fetch(`${apiUrl}/code/save-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: sessionName.trim(),
          files,
          framework,
          prompt,
          activeFile,
          hasGenerated
        }),
      });

      const data = await response.json();
      console.log('Save session response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to save session');
      }

      setSessionName('');
      setError('Session saved successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error saving session:', err);
      setError(err.message || 'Failed to save session. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleUpdateSession = async () => {
    if (!sessionId) {
      setError('No session to update');
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to update sessions');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${apiUrl}/code/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: sessionName.trim() || 'New Session',
          files,
          framework,
          prompt,
          activeFile,
          hasGenerated
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to update session');
      }

      setError('Session updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err.message || 'Failed to update session. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-10 font-mono relative overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: "#0f0f11",
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: false,
                mode: "repulse",
                distance: 150,
              },
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 150,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#7c3aed",
            },
            links: {
              color: "#7c3aed",
              distance: 150,
              enable: true,
              opacity: 0.8,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      />

      <div className="mt-15 max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">⚡ Front-Fusion UI Generator</h1>
          <div className="flex gap-4">
            {sessionId && (
              <button
                onClick={handleUpdateSession}
                disabled={loading.update}
                className={`text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 ${
                  loading.update
                    ? 'bg-blue-600 opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading.update ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Session'}
              </button>
            )}
            <Link
              href="/user/sessions"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
            >
              View Sessions
            </Link>
          </div>
        </div>

        {loading.load && (
          <div className="flex items-center justify-center mb-8">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Loading session...</span>
          </div>
        )}

        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-xl mb-8 border border-[#2a2a2e]">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <textarea
              className="w-full bg-transparent text-white p-4 border border-[#333] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your UI prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={loading.generate || loading.modify}
            />

            {Object.keys(files).length > 0 && (
              <textarea
                className="w-full bg-transparent text-white p-4 border border-[#333] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="How would you like to modify the code?"
                value={modificationPrompt}
                onChange={(e) => setModificationPrompt(e.target.value)}
                rows={4}
                disabled={loading.modify}
              />
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300">Use:</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="bg-[#1a1a1d] text-white border border-[#333] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading.generate || loading.modify}
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="react">React</option>
                <option value="both">React + Tailwind</option>
              </select>

              <button
                onClick={() => fileInputRef.current.click()}
                className="text-white px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all"
                disabled={loading.generate || loading.modify}
              >
                Upload Code
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept=".html,.js,.jsx,.tsx,.css"
              />
            </div>

            <div className="flex gap-2">
              {Object.keys(files).length > 0 && (
                <>
                  <button
                    onClick={handleModifyCode}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-32"
                    disabled={loading.modify || loading.generate || !modificationPrompt.trim()}
                  >
                    {loading.modify ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Modifying...
                      </>
                    ) : 'Modify Code'}
                  </button>
                </>
              )}

              <button
                onClick={handleGenerate}
                className={`text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 ${loading.generate || loading.modify
                    ? 'bg-purple-600 opacity-50'
                    : prompt.trim()
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-purple-600/30 cursor-not-allowed'
                  }`}
                disabled={loading.generate || loading.modify || !prompt.trim()}
              >
                {loading.generate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : hasGenerated ? 'Generate' : 'Generate UI'}
              </button>
            </div>
          </div>

          {Object.keys(files).length > 0 && (
            <div className="flex items-center gap-4 mt-4">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                className="bg-transparent text-white p-2 border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSaveSession}
                disabled={loading.save || !sessionName.trim()}
                className={`text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 ${
                  loading.save || !sessionName.trim()
                    ? 'bg-green-600 opacity-50'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading.save ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Session'}
              </button>
            </div>
          )}

          {error && (
            <div className={`text-${error.includes('successfully') ? 'green' : 'red'}-500 p-2 ${error.includes('successfully') ? 'bg-green-900/20' : 'bg-red-900/20'} rounded-lg flex items-center mt-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {Object.keys(files).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {maximizedPanel !== 'preview' && (
              <div className={`${maximizedPanel === 'code' ? 'md:col-span-3' : 'md:col-span-2'}`}>
                <div className="bg-[#1a1a1d] p-4 rounded-2xl border border-[#2a2a2e] h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">📁 Files</h2>
                    <button
                      onClick={handleDownloadAll}
                      className="text-sm text-purple-400 hover:underline"
                      disabled={loading.generate || loading.modify}
                    >
                      Download All
                    </button>
                  </div>
                  <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                    {Object.keys(files).map((file) => (
                      <li
                        key={file}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#2a2a2e] text-sm ${file === activeFile ? 'bg-[#2a2a2e] text-purple-400' : ''}`}
                        onClick={() => setActiveFile(file)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{file}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                            className="text-xs text-gray-400 hover:text-purple-400 ml-2"
                            disabled={loading.generate || loading.modify}
                          >
                            ⬇
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {maximizedPanel !== 'preview' && (
              <div className={`${maximizedPanel === 'code' ? 'md:col-span-9' : 'md:col-span-6'}`}>
                <div className="bg-[#1a1a1d] p-4 rounded-2xl border border-[#2a2a2e] h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">📝 {activeFile}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleMaximize('code')}
                        className="text-gray-400 hover:text-white"
                        title={maximizedPanel === 'code' ? 'Minimize' : 'Maximize'}
                        disabled={loading.generate || loading.modify}
                      >
                        {maximizedPanel === 'code' ? '🗗' : '🗖'}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="text-purple-400 text-sm hover:underline copy-button"
                        disabled={loading.generate || loading.modify}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={files[activeFile] || ''}
                    onChange={(e) => handleFileChange(activeFile, e.target.value)}
                    className="w-full h-[500px] bg-[#121214] text-green-400 p-4 rounded-lg border border-[#333] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    disabled={loading.modify}
                  />
                </div>
              </div>
            )}

            {maximizedPanel !== 'code' && (
              <div className={`${maximizedPanel === 'preview' ? 'md:col-span-12' : 'md:col-span-4'}`}>
                <div className="bg-[#1a1a1d] p-4 rounded-2xl border border-[#2a2a2e] h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">👀 Live Preview</h2>
                    <button
                      onClick={() => toggleMaximize('preview')}
                      className="text-gray-400 hover:text-white"
                      title={maximizedPanel === 'preview' ? 'Minimize' : 'Maximize'}
                      disabled={loading.generate || loading.modify}
                    >
                      {maximizedPanel === 'preview' ? '🗗' : '🗖'}
                    </button>
                  </div>
                  <div
                    ref={previewRef}
                    className="bg-white rounded-xl text-black overflow-auto min-h-[500px]"
                  >
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              body { margin: 0; padding: 0; }
                            </style>
                          </head>
                          <body>
                            ${extractCode(files[activeFile] || '<div class="p-4 text-gray-500">No preview available</div>')}
                          </body>
                        </html>
                      `}
                      className="w-full h-[500px] border-0"
                      title="Preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {Object.keys(files).length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">👀 Sandpack Live Preview</h2>
            <Sandpack
              files={files}
              theme="dark"
              template={framework === 'tailwind' ? 'static' : 'vite-react'}
              options={{
                showConsoleButton: true,
                showInlineErrors: true,
                showNavigator: true,
                showLineNumbers: true,
                showTabs: true,
              }}
              customSetup={{
                dependencies: framework === 'tailwind' ? {} : {
                  'react': '^18.2.0',
                  'react-dom': '^18.2.0',
                  'tailwindcss': '^3.3.0',
                  '@tailwindcss/forms': '^0.5.7',
                  '@vitejs/plugin-react': '^4.2.0',
                  'vite': '^5.0.0'
                },
                entry: framework === 'tailwind' ? '/index.html' : '/src/main.jsx',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;