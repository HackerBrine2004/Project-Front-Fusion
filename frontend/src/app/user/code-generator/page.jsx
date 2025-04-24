'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';

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
  const [prompt, setPrompt] = useState('design a login page');
  const [framework, setFramework] = useState('tailwind');
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({ generate: false, modify: false });
  const [maximizedPanel, setMaximizedPanel] = useState(null);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  // Auto-scroll preview when code changes
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
    }
  }, [files, activeFile]);

  const handleGenerate = async () => {
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

        // Check for HTML error responses
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
        setFiles(fileData);
        setActiveFile(Object.keys(fileData)[0] || '');

        // Scroll to the top of the page
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

      // Check for HTML error responses
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

    // Validate file type
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

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-10 font-mono">
      <div className="mt-15 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">⚡ Front-Fusion UI Generator</h1>

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
                className="bg-[#2a2a2e] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-all"
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
              )}

              <button
                onClick={handleGenerate}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-32"
                disabled={loading.generate || loading.modify}
              >
                {loading.generate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Generate UI'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 p-2 bg-red-900/20 rounded-lg flex items-center">
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
                    className="bg-white p-4 rounded-xl text-black overflow-auto min-h-[500px]"
                    dangerouslySetInnerHTML={{ __html: extractCode(files[activeFile] || '<div class="p-4 text-gray-500">No preview available</div>') }}
                  />
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
              theme="light"
              template="react"
              options={{
                showConsoleButton: true,
                showInlineErrors: true,
                showNavigator: true,
                showLineNumbers: true,
                showTabs: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;