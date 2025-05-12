'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { tsParticles } from 'tsparticles-engine';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

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
  const [previewTheme, setPreviewTheme] = useState('');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [customColors, setCustomColors] = useState({
    background: '#0f172a',
    text: '#e2e8f0',
    border: '#334155',
    primary: '#7c3aed',
    secondary: '#4f46e5',
    accent: '#06b6d4'
  });
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
    // Only attempt to load a session if an ID is provided in the URL
    if (id) {
      // Check if the session ID is valid
      setSessionId(id);
      loadSession(id);
    }
    console.log('Session ID:', id);
    // Otherwise, we're creating a new session - no need to load anything
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
        // if (response.status === 401) {
        //   localStorage.removeItem('token');
        //   router.push('/auth/login');
        //   return;
        // }
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

  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'light':
        return {
          background: {
            from: ['bg-gray-900', 'bg-slate-900', 'bg-zinc-900', 'bg-neutral-900', 'bg-stone-900'],
            to: 'bg-white'
          },
          text: {
            from: ['text-gray-100', 'text-slate-100', 'text-zinc-100', 'text-neutral-100', 'text-stone-100'],
            to: 'text-gray-900'
          },
          border: {
            from: ['border-gray-700', 'border-slate-700', 'border-zinc-700', 'border-neutral-700', 'border-stone-700'],
            to: 'border-gray-200'
          },
          hover: {
            from: ['hover:bg-gray-800', 'hover:bg-slate-800', 'hover:bg-zinc-800', 'hover:bg-neutral-800', 'hover:bg-stone-800'],
            to: 'hover:bg-gray-50'
          },
          button: {
            from: ['bg-violet-600', 'bg-indigo-600', 'bg-purple-600'],
            to: 'bg-blue-600'
          },
          input: {
            from: ['bg-gray-800', 'bg-slate-800', 'bg-zinc-800', 'bg-neutral-800', 'bg-stone-800'],
            to: 'bg-white'
          },
          heading: {
            from: ['text-violet-400', 'text-indigo-400', 'text-purple-400'],
            to: 'text-blue-600'
          },
          card: {
            from: ['bg-gray-800', 'bg-slate-800', 'bg-zinc-800', 'bg-neutral-800', 'bg-stone-800'],
            to: 'bg-gray-50'
          }
        };
      case 'dark':
        return {
          background: {
            from: ['bg-white', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-900'
          },
          text: {
            from: ['text-gray-900', 'text-slate-900', 'text-zinc-900', 'text-neutral-900', 'text-stone-900'],
            to: 'text-gray-100'
          },
          border: {
            from: ['border-gray-200', 'border-slate-200', 'border-zinc-200', 'border-neutral-200', 'border-stone-200'],
            to: 'border-gray-700'
          },
          hover: {
            from: ['hover:bg-gray-50', 'hover:bg-slate-50', 'hover:bg-zinc-50', 'hover:bg-neutral-50', 'hover:bg-stone-50'],
            to: 'hover:bg-gray-800'
          },
          button: {
            from: ['bg-blue-600', 'bg-indigo-600', 'bg-sky-600'],
            to: 'bg-violet-600'
          },
          input: {
            from: ['bg-white', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-800'
          },
          heading: {
            from: ['text-blue-600', 'text-indigo-600', 'text-sky-600'],
            to: 'text-violet-400'
          },
          card: {
            from: ['bg-gray-50', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-800'
          }
        };
      case 'custom':
        const getTailwindColor = (hex) => {
          const colorMap = {
            '#0f172a': 'slate-900',
            '#1e293b': 'slate-800',
            '#334155': 'slate-700',
            '#475569': 'slate-600',
            '#64748b': 'slate-500',
            '#94a3b8': 'slate-400',
            '#cbd5e1': 'slate-300',
            '#e2e8f0': 'slate-200',
            '#f1f5f9': 'slate-100',
            '#f8fafc': 'slate-50',
            '#7c3aed': 'violet-600',
            '#6d28d9': 'violet-700',
            '#4f46e5': 'indigo-600',
            '#4338ca': 'indigo-700',
            '#06b6d4': 'cyan-500',
            '#0891b2': 'cyan-600',
          };
          return colorMap[hex.toLowerCase()] || 'gray-500';
        };

        return {
          background: {
            from: ['bg-white', 'bg-gray-900', 'bg-slate-900', 'bg-zinc-900', 'bg-neutral-900', 'bg-stone-900'],
            to: `bg-${getTailwindColor(customColors.background)}`
          },
          text: {
            from: ['text-gray-900', 'text-gray-100', 'text-slate-100', 'text-zinc-100', 'text-neutral-100', 'text-stone-100'],
            to: `text-${getTailwindColor(customColors.text)}`
          },
          border: {
            from: ['border-gray-200', 'border-gray-700', 'border-slate-700', 'border-zinc-700', 'border-neutral-700', 'border-stone-700'],
            to: `border-${getTailwindColor(customColors.border)}`
          },
          hover: {
            from: ['hover:bg-gray-50', 'hover:bg-gray-800', 'hover:bg-slate-800', 'hover:bg-zinc-800', 'hover:bg-neutral-800', 'hover:bg-stone-800'],
            to: `hover:bg-${getTailwindColor(customColors.background)}/80`
          },
          button: {
            from: ['bg-blue-600', 'bg-violet-600', 'bg-indigo-600', 'bg-purple-600'],
            to: `bg-${getTailwindColor(customColors.primary)}`
          },
          input: {
            from: ['bg-white', 'bg-gray-800', 'bg-slate-800', 'bg-zinc-800', 'bg-neutral-800', 'bg-stone-800'],
            to: `bg-${getTailwindColor(customColors.background)}`
          },
          heading: {
            from: ['text-blue-600', 'text-violet-600', 'text-indigo-600', 'text-purple-600'],
            to: `text-${getTailwindColor(customColors.primary)}`
          },
          card: {
            from: ['bg-gray-50', 'bg-gray-800', 'bg-slate-800', 'bg-zinc-800', 'bg-neutral-800', 'bg-stone-800'],
            to: `bg-${getTailwindColor(customColors.background)}`
          }
        };
      default:
        return {
          background: {
            from: ['bg-white', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-900'
          },
          text: {
            from: ['text-gray-900', 'text-slate-900', 'text-zinc-900', 'text-neutral-900', 'text-stone-900'],
            to: 'text-gray-100'
          },
          border: {
            from: ['border-gray-200', 'border-slate-200', 'border-zinc-200', 'border-neutral-200', 'border-stone-200'],
            to: 'border-gray-700'
          },
          hover: {
            from: ['hover:bg-gray-50', 'hover:bg-slate-50', 'hover:bg-zinc-50', 'hover:bg-neutral-50', 'hover:bg-stone-50'],
            to: 'hover:bg-gray-800'
          },
          button: {
            from: ['bg-blue-600', 'bg-indigo-600', 'bg-sky-600'],
            to: 'bg-violet-600'
          },
          input: {
            from: ['bg-white', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-800'
          },
          heading: {
            from: ['text-blue-600', 'text-indigo-600', 'text-sky-600'],
            to: 'text-violet-400'
          },
          card: {
            from: ['bg-gray-50', 'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'],
            to: 'bg-gray-800'
          }
        };
    }
  };

  const applyThemeToCode = (code, theme) => {
    if (!code) return '';
    
    const getTailwindColor = (hex) => {
      const colorMap = {
        '#0f172a': 'slate-900',
        '#1e293b': 'slate-800',
        '#334155': 'slate-700',
        '#475569': 'slate-600',
        '#64748b': 'slate-500',
        '#94a3b8': 'slate-400',
        '#cbd5e1': 'slate-300',
        '#e2e8f0': 'slate-200',
        '#f1f5f9': 'slate-100',
        '#f8fafc': 'slate-50',
        '#7c3aed': 'violet-600',
        '#6d28d9': 'violet-700',
        '#4f46e5': 'indigo-600',
        '#4338ca': 'indigo-700',
        '#06b6d4': 'cyan-500',
        '#0891b2': 'cyan-600',
      };
      return colorMap[hex.toLowerCase()] || 'gray-500';
    };

    let themedCode = code;

    if (theme === 'light') {
      // Light theme replacements
      themedCode = themedCode
        .replace(/bg-(?:gray|slate|zinc|neutral|stone)-900/g, 'bg-white')
        .replace(/text-(?:gray|slate|zinc|neutral|stone)-100/g, 'text-gray-900')
        .replace(/border-(?:gray|slate|zinc|neutral|stone)-700/g, 'border-gray-200')
        .replace(/hover:bg-(?:gray|slate|zinc|neutral|stone)-800/g, 'hover:bg-gray-50')
        .replace(/bg-(?:violet|indigo|purple)-600/g, 'bg-blue-600')
        .replace(/bg-(?:gray|slate|zinc|neutral|stone)-800/g, 'bg-white')
        .replace(/text-(?:violet|indigo|purple)-400/g, 'text-blue-600')
        .replace(/bg-(?:gray|slate|zinc|neutral|stone)-800/g, 'bg-gray-50');
    } else if (theme === 'dark') {
      // Dark theme replacements
      themedCode = themedCode
        .replace(/bg-white|bg-(?:slate|zinc|neutral|stone)-50/g, 'bg-gray-900')
        .replace(/text-(?:gray|slate|zinc|neutral|stone)-900/g, 'text-gray-100')
        .replace(/border-(?:gray|slate|zinc|neutral|stone)-200/g, 'border-gray-700')
        .replace(/hover:bg-(?:gray|slate|zinc|neutral|stone)-50/g, 'hover:bg-gray-800')
        .replace(/bg-(?:blue|indigo|sky)-600/g, 'bg-violet-600')
        .replace(/bg-white|bg-(?:slate|zinc|neutral|stone)-50/g, 'bg-gray-800')
        .replace(/text-(?:blue|indigo|sky)-600/g, 'text-violet-400')
        .replace(/bg-(?:gray|slate|zinc|neutral|stone)-50/g, 'bg-gray-800');
    } else if (theme === 'custom') {
      // Custom theme replacements
      themedCode = themedCode
        .replace(/bg-(?:white|gray|slate|zinc|neutral|stone)-(?:50|800|900)/g, `bg-${getTailwindColor(customColors.background)}`)
        .replace(/text-(?:gray|slate|zinc|neutral|stone)-(?:100|900)/g, `text-${getTailwindColor(customColors.text)}`)
        .replace(/border-(?:gray|slate|zinc|neutral|stone)-(?:200|700)/g, `border-${getTailwindColor(customColors.border)}`)
        .replace(/hover:bg-(?:gray|slate|zinc|neutral|stone)-(?:50|800)/g, `hover:bg-${getTailwindColor(customColors.background)}/80`)
        .replace(/bg-(?:blue|violet|indigo|purple|cyan)-600/g, `bg-${getTailwindColor(customColors.primary)}`)
        .replace(/text-(?:blue|violet|indigo|purple|cyan)-(?:400|600)/g, `text-${getTailwindColor(customColors.primary)}`)
        .replace(/focus:ring-(?:blue|violet|indigo|purple|cyan)-[^"'\s]+/g, `focus:ring-${getTailwindColor(customColors.accent)}`)
        .replace(/focus:border-(?:blue|violet|indigo|purple|cyan)-[^"'\s]+/g, `focus:border-${getTailwindColor(customColors.accent)}`)
        .replace(/hover:bg-(?:blue|violet|indigo|purple|cyan)-[^"'\s]+/g, `hover:bg-${getTailwindColor(customColors.secondary)}`)
        .replace(/hover:text-(?:blue|violet|indigo|purple|cyan)-[^"'\s]+/g, `hover:text-${getTailwindColor(customColors.primary)}`);
    }

    return themedCode;
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

      // Apply theme to the generated code
      const themedFileData = {};
      Object.entries(fileData).forEach(([fileName, content]) => {
        themedFileData[fileName] = applyThemeToCode(content, previewTheme);
      });

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
          'src/App.jsx': themedFileData['index.html'],
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
        setFiles(themedFileData);
      }

      setActiveFile(Object.keys(themedFileData)[0] || '');

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
  // const handleClear = () => {
  //   setFiles({});
  //   setActiveFile('');
  //   setHasGenerated(false);
  //   setPrompt('');
  //   setModificationPrompt('');
  //   if (typeof window !== 'undefined') {
  //     localStorage.removeItem('generatedFiles');
  //     localStorage.removeItem('activeFile');
  //     localStorage.removeItem('hasGenerated');
  //   }
  // };

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

      const decodedToken = jwtDecode(token);
      
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
          // localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          // router.push('/auth/login');
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
          // localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          // router.push('/auth/login');
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

  // Add theme change handler
  const handleThemeChange = async (newTheme) => {
    setPreviewTheme(newTheme);
    
    if (newTheme === 'custom') {
      setShowColorPalette(true);
      return;
    }

    if (!activeFile || !files[activeFile]) {
      return;
    }

    setLoading(prev => ({ ...prev, modify: true }));
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code/modify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: files[activeFile],
          instructions: `Change the theme to ${newTheme} theme. Apply appropriate background colors, text colors, border colors, and interactive element colors for a ${newTheme} theme.`,
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
        throw new Error(data.error || 'Failed to apply theme');
      }

      const modifiedCode = extractCode(data.result || 'No modified code generated.');
      setFiles(prev => ({ ...prev, [activeFile]: modifiedCode }));
    } catch (err) {
      setError(err.message.includes('<!DOCTYPE') ? 'Server error occurred' : err.message);
      console.error("Theme change error:", err);
    } finally {
      setLoading(prev => ({ ...prev, modify: false }));
    }
  };

  // Add color palette modal component
  const ColorPaletteModal = () => {
    if (!showColorPalette) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        setShowColorPalette(false);
      }
    };

    const handleApplyColors = async () => {
      if (!activeFile || !files[activeFile]) {
        setShowColorPalette(false);
        return;
      }

      setLoading(prev => ({ ...prev, modify: true }));
      setError('');

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code/modify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: files[activeFile],
            instructions: `Apply a custom theme with the following colors:
              - Background: ${customColors.background}
              - Text: ${customColors.text}
              - Border: ${customColors.border}
              - Primary: ${customColors.primary}
              - Secondary: ${customColors.secondary}
              - Accent: ${customColors.accent}
              Update all relevant Tailwind classes to match this color scheme.`,
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
          throw new Error(data.error || 'Failed to apply custom theme');
        }

        const modifiedCode = extractCode(data.result || 'No modified code generated.');
        setFiles(prev => ({ ...prev, [activeFile]: modifiedCode }));
        setShowColorPalette(false);
      } catch (err) {
        setError(err.message.includes('<!DOCTYPE') ? 'Server error occurred' : err.message);
        console.error("Custom theme error:", err);
      } finally {
        setLoading(prev => ({ ...prev, modify: false }));
      }
    };

    const colorSections = [
      {
        title: "Main Colors",
        description: "Primary colors used throughout the UI",
        colors: [
          {
            label: "Background",
            description: "Main background color for the page",
            value: customColors.background,
            onChange: (value) => setCustomColors(prev => ({ ...prev, background: value }))
          },
          {
            label: "Text",
            description: "Primary text color",
            value: customColors.text,
            onChange: (value) => setCustomColors(prev => ({ ...prev, text: value }))
          },
          {
            label: "Border",
            description: "Color for borders and dividers",
            value: customColors.border,
            onChange: (value) => setCustomColors(prev => ({ ...prev, border: value }))
          }
        ]
      },
      {
        title: "Interactive Elements",
        description: "Colors for buttons and interactive components",
        colors: [
          {
            label: "Primary Button",
            description: "Main action buttons and primary elements",
            value: customColors.primary,
            onChange: (value) => setCustomColors(prev => ({ ...prev, primary: value }))
          },
          {
            label: "Secondary Button",
            description: "Secondary actions and hover states",
            value: customColors.secondary,
            onChange: (value) => setCustomColors(prev => ({ ...prev, secondary: value }))
          },
          {
            label: "Accent",
            description: "Focus states and highlights",
            value: customColors.accent,
            onChange: (value) => setCustomColors(prev => ({ ...prev, accent: value }))
          }
        ]
      }
    ];

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-[#1a1a1d] p-6 rounded-2xl border border-violet-500/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                Custom Theme Colors
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Customize colors for different UI elements
              </p>
            </div>
            <button
              onClick={() => setShowColorPalette(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {colorSections.map((section, index) => (
              <div key={index} className="bg-black/40 rounded-xl p-4 border border-violet-500/20">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-violet-300">{section.title}</h4>
                  <p className="text-sm text-gray-400">{section.description}</p>
                </div>
                
                <div className="space-y-4">
                  {section.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-300">{color.label}</label>
                          <p className="text-xs text-gray-400">{color.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color.value}
                            onChange={(e) => color.onChange(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-violet-500/30"
                          />
                          <input
                            type="text"
                            value={color.value}
                            onChange={(e) => color.onChange(e.target.value)}
                            className="w-24 bg-black/40 text-white p-2 rounded-lg border border-violet-500/30 text-sm"
                          />
                        </div>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden bg-black/40">
                        <div 
                          className="h-full" 
                          style={{ 
                            width: '100%', 
                            background: `linear-gradient(to right, ${color.value}, ${color.value}80)`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowColorPalette(false)}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyColors}
              disabled={loading.modify}
              className={`px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors ${
                loading.modify ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading.modify ? 'Applying...' : 'Apply Colors'}
            </button>
          </div>
        </div>
      </div>
    );
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

    {/* Ambient glowing orbs */}
    <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl"></div>
    <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full bg-cyan-600/20 blur-3xl"></div>

    <div className="mt-15 max-w-[95%] mx-auto relative z-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 animate-gradient bg-300%">⚡ Front-Fusion UI Generator</h1>
        <div className="flex gap-4">
          {sessionId && (
            <button
              onClick={handleUpdateSession}
              disabled={loading.update}
              className={`relative text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 overflow-hidden group ${
                loading.update
                  ? 'bg-blue-600/50 opacity-50'
                  : 'bg-blue-600/70 hover:bg-blue-600/90'
              }`}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/50 to-violet-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                {loading.update ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Session'}
              </span>
            </button>
          )}
          <Link
            href="/user/sessions"
            className="relative bg-gradient-to-r from-violet-600/70 to-purple-600/70 text-white px-6 py-2 rounded-lg hover:from-violet-500/90 hover:to-purple-500/90 transition-all overflow-hidden group shadow-[0_0_10px_rgba(138,43,226,0.2)]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600/50 to-purple-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">View Sessions</span>
          </Link>
        </div>
      </div>

      {loading.load && (
        <div className="flex items-center justify-center mb-8">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-cyan-300">Loading session...</span>
        </div>
      )}

      <div className="bg-[#1a1a1d]/90 p-6 rounded-2xl shadow-xl mb-8 border border-violet-500/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <textarea
            className="w-full bg-black/40 text-white p-4 border border-violet-500/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Enter your UI prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={loading.generate || loading.modify}
          />

          {Object.keys(files).length > 0 && (
            <textarea
              className="w-full bg-black/40 text-white p-4 border border-violet-500/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="bg-black/40 text-white border border-violet-500/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={loading.generate || loading.modify}
            >
              <option value="tailwind">Tailwind CSS</option>
              <option value="react">React</option>
              <option value="both">React + Tailwind</option>
            </select>

            <button
              onClick={() => fileInputRef.current.click()}
              className="text-white px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600/70 to-purple-600/70 hover:from-violet-500/90 hover:to-purple-500/90 transition-all shadow-[0_0_10px_rgba(138,43,226,0.2)]"
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
                  className={`relative bg-gradient-to-r from-blue-600/70 to-cyan-600/70 text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 overflow-hidden group shadow-[0_0_10px_rgba(0,149,255,0.2)] ${
                    loading.modify || loading.generate || !modificationPrompt.trim() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-blue-500/90 hover:to-cyan-500/90'
                  }`}
                  disabled={loading.modify || loading.generate || !modificationPrompt.trim()}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/50 to-cyan-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    {loading.modify ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Modifying...
                      </>
                    ) : 'Modify Code'}
                  </span>
                </button>
              </>
            )}

            <button
              onClick={handleGenerate}
              className={`relative text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 overflow-hidden group ${
                loading.generate || loading.modify
                  ? 'bg-violet-600/50 opacity-50 cursor-not-allowed'
                  : prompt.trim()
                    ? 'bg-gradient-to-r from-violet-600/70 to-purple-600/70 hover:from-violet-500/90 hover:to-purple-500/90 shadow-[0_0_10px_rgba(138,43,226,0.2)]'
                    : 'bg-violet-600/30 cursor-not-allowed'
                }`}
              disabled={loading.generate || loading.modify || !prompt.trim()}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600/50 to-purple-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                {loading.generate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : hasGenerated ? 'Generate' : 'Generate UI'}
              </span>
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
              className="bg-black/40 text-white p-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={handleSaveSession}
              disabled={loading.save || !sessionName.trim()}
              className={`relative text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center min-w-32 overflow-hidden group ${
                loading.save || !sessionName.trim()
                  ? 'bg-green-600/50 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600/70 to-teal-600/70 hover:from-green-500/90 hover:to-teal-500/90 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              }`}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600/50 to-teal-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                {loading.save ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Session'}
              </span>
            </button>
          </div>
        )}

        {error && (
          <div className={`text-${error.includes('successfully') ? 'green' : 'red'}-500 p-2 ${error.includes('successfully') ? 'bg-green-900/20' : 'bg-red-900/20'} rounded-lg flex items-center mt-4 border ${error.includes('successfully') ? 'border-green-500/30' : 'border-red-500/30'}`}>
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
              <div className="bg-[#1a1a1d]/90 p-4 rounded-2xl border border-violet-500/30 backdrop-blur-sm h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">📁 Files</h2>
                  <button
                    onClick={handleDownloadAll}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1"
                    disabled={loading.generate || loading.modify}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download All
                  </button>
                </div>
                <ul className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent pr-2">
                  {Object.keys(files).map((file) => (
                    <li
                      key={file}
                      className={`cursor-pointer px-3 py-2 rounded-lg hover:bg-violet-500/20 text-sm transition-colors duration-200 ${
                        file === activeFile ? 'bg-violet-500/20 text-cyan-300 border-l-2 border-cyan-400' : ''
                      }`}
                      onClick={() => setActiveFile(file)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate flex-1">{file}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                          className="text-xs text-gray-400 hover:text-cyan-400 ml-2 transition-colors duration-200 flex items-center gap-1"
                          disabled={loading.generate || loading.modify}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
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
              <div className="bg-[#1a1a1d]/90 p-4 rounded-2xl border border-violet-500/30 backdrop-blur-sm h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">📝 {activeFile}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMaximize('code')}
                      className="text-gray-400 hover:text-cyan-300 transition-colors duration-200"
                      title={maximizedPanel === 'code' ? 'Minimize' : 'Maximize'}
                      disabled={loading.generate || loading.modify}
                    >
                      {maximizedPanel === 'code' ? '🗗' : '🗖'}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors duration-200 copy-button"
                      disabled={loading.generate || loading.modify}
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
                <textarea
                  value={files[activeFile] || ''}
                  onChange={(e) => handleFileChange(activeFile, e.target.value)}
                  className="w-full h-[500px] bg-black/40 text-green-400 p-4 rounded-lg border border-violet-500/30 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                  disabled={loading.modify}
                />
              </div>
            </div>
          )}

          {maximizedPanel !== 'code' && (
            <div className={`${maximizedPanel === 'preview' ? 'md:col-span-12' : 'md:col-span-4'}`}>
              <div className="bg-[#1a1a1d]/90 p-4 rounded-2xl border border-violet-500/30 backdrop-blur-sm h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">👀 Live Preview</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <select
                        value={previewTheme}
                        onChange={(e) => {
                          const newTheme = e.target.value;
                          if (newTheme === 'custom') {
                            setShowColorPalette(true);
                          } else {
                            handleThemeChange(newTheme);
                          }
                        }}
                        disabled={loading.modify}
                        className={`appearance-none bg-black/40 text-white border border-violet-500/30 rounded-lg px-4 py-2 pl-8 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer ${
                          loading.modify ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="" disabled>Select a theme</option>
                        <option value="dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                        <option value="custom">Custom Theme</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className={`w-4 h-4 ${loading.modify ? 'text-violet-400/50' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className={`w-4 h-4 ${loading.modify ? 'text-violet-400/50' : 'text-violet-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMaximize('preview')}
                      className="text-gray-400 hover:text-cyan-300 transition-colors duration-200"
                      title={maximizedPanel === 'preview' ? 'Minimize' : 'Maximize'}
                      disabled={loading.generate || loading.modify}
                    >
                      {maximizedPanel === 'preview' ? '🗗' : '🗖'}
                    </button>
                  </div>
                </div>
                <div
                  ref={previewRef}
                  className="bg-white rounded-xl text-black overflow-auto min-h-[500px] border border-violet-500/30 relative"
                >
                  {loading.modify && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-white font-medium">Applying Theme...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            body { 
                              margin: 0; 
                              padding: 0; 
                              background-color: ${previewTheme ? getThemeStyles(previewTheme).background : '#ffffff'};
                              color: ${previewTheme ? getThemeStyles(previewTheme).text : '#000000'};
                            }
                            * {
                              border-color: ${previewTheme ? getThemeStyles(previewTheme).border : '#e5e7eb'};
                            }
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
          <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">👀 Sandpack Live Preview</h2>
          <div className="rounded-xl overflow-hidden border border-violet-500/30 shadow-[0_0_15px_rgba(138,43,226,0.1)] relative w-full">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            
            
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
        </div>
      )}
      
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
        
        .bg-300\% {
          background-size: 300% 300%;
        }
        
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(124, 58, 237, 0.3);
          border-radius: 20px;
        }
      `}</style>

      {/* Add the ColorPaletteModal component */}
      <ColorPaletteModal />
    </div>
  </div>
);
}
export default CodeGenerator;