import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Copy, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { ProjectsDatabase } from '../types';
import { initialProjectsDatabase } from '../data/defaultProjects';
import { exportDatabaseAsJsonFile } from '../services/projectsApi';

interface JsonDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: ProjectsDatabase;
  onSaveDatabase: (newDb: ProjectsDatabase) => Promise<void>;
}

export const JsonDatabaseModal: React.FC<JsonDatabaseModalProps> = ({
  isOpen,
  onClose,
  database,
  onSaveDatabase,
}) => {
  if (!isOpen) return null;

  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(database, null, 2));
    setError(null);
  }, [database, isOpen]);

  const handleValidateAndSave = async () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonText);

      if (!parsed || !Array.isArray(parsed.projects)) {
        setError('Invalid schema: The root object must contain a "projects" array.');
        return;
      }

      setIsSaving(true);
      await onSaveDatabase(parsed);
      setIsSaving(false);
      setSuccessMessage('JSON Database updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.projects || !Array.isArray(parsed.projects)) {
          setError('Uploaded JSON does not have a valid "projects" array.');
          return;
        }
        setJsonText(JSON.stringify(parsed, null, 2));
        setError(null);
        setSuccessMessage('File loaded into editor! Click "Save to Database" to apply.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: any) {
        setError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset database back to the original default projects?')) {
      setJsonText(JSON.stringify(initialProjectsDatabase, null, 2));
      setError(null);
      setSuccessMessage('Reset default template loaded. Click "Save to Database" to apply.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  JSON Database Manager
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                  data/projects.json
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All projects in Dripjects are stored here. Everything listed here will appear in the app.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Raw JSON'}</span>
            </button>

            <button
              onClick={() => exportDatabaseAsJsonFile(database)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Download projects.json to your computer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON File</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-red-500/15 text-slate-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
              title="Reset to default initial dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            {database.projects.length} Projects • {Math.round(jsonText.length / 1024)} KB
          </div>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Live Code Editor Body */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-[350px]">
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Direct JSON Editor:</span>
            <span className="text-slate-500">Ctrl/Cmd + Scroll to zoom</span>
          </div>
          <textarea
            id="json-database-editor"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 resize-none overflow-auto leading-relaxed selection:bg-emerald-900 selection:text-white"
          />
        </div>

        {/* Footer Save & Cancel */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-between">
          <p className="text-xs text-slate-400 hidden sm:block">
            Edits will be verified for valid syntax and synced immediately.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="save-json-database-btn"
              onClick={handleValidateAndSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 active:scale-95 rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Sync Database'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
