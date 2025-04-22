'use client';
import React, { useState } from 'react';

const extractCode = (text) => {
  const codeBlockMatch = text.match(/```(?:html|jsx|tsx)?\n([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  return text
    .split('\n')
    .filter(line =>
      !line.trim().startsWith('*') &&
      !line.trim().toLowerCase().startsWith('key improvements') &&
      !line.trim().startsWith('#') &&
      !line.trim().startsWith('```')
    )
    .join('\n')
    .trim();
};

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('design a login page');
  const [framework, setFramework] = useState('tailwind');
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState(null); // 'code' or 'preview'

  const handleGenerate = async () => {
    setError('');
    setFiles({});
    setActiveFile('');
    setLoading(true);

    try {
      const finalPrompt = `${prompt} using ${framework === 'both' ? 'React and Tailwind CSS' : framework}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/code/generate-ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to generate code');
      }

      const data = await response.json();
      const cleanedResult = extractCode(data.result || 'No code generated.');
      const fileData = data.files || { 'index.html': cleanedResult };
      setFiles(fileData);
      setActiveFile(Object.keys(fileData)[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (activeFile) navigator.clipboard.writeText(files[activeFile]);
  };

  const handleFileChange = (fileName, content) => {
    setFiles({ ...files, [fileName]: content });
  };

  const handleDownloadFile = (fileName) => {
    const blob = new Blob([files[fileName]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
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
  };

  const toggleMaximize = (panel) => {
    if (maximizedPanel === panel) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(panel);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white px-6 py-10 font-mono">
      <div className="mt-15 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">⚡ Front-Fusion UI Generator</h1>

        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-xl mb-8 border border-[#2a2a2e]">
          <textarea
            className="w-full bg-transparent text-white p-4 border border-[#333] rounded-xl mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your UI prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300">Use:</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="bg-[#1a1a1d] text-white border border-[#333] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="react">React</option>
                <option value="both">React + Tailwind</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate UI'}
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}
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
                      >
                        {maximizedPanel === 'code' ? '🗗' : '🗖'}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="text-purple-400 text-sm hover:underline"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={files[activeFile] || ''}
                    onChange={(e) => handleFileChange(activeFile, e.target.value)}
                    className="w-full h-[500px] bg-[#121214] text-green-400 p-4 rounded-lg border border-[#333] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    >
                      {maximizedPanel === 'preview' ? '🗗' : '🗖'}
                    </button>
                  </div>
                  <div
                    className="bg-white p-4 rounded-xl text-black overflow-auto min-h-[500px]"
                    dangerouslySetInnerHTML={{ __html: extractCode(files[activeFile] || '') }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;