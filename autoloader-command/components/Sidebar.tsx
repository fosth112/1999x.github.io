import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Settings, Code, Bot } from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: Tab.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { id: Tab.CONFIGURE, label: 'Configuration', icon: Settings },
    { id: Tab.CLIENT_SCRIPT, label: 'Python Client', icon: Code },
    { id: Tab.GEMINI_HELP, label: 'AI Assistant', icon: Bot },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-emerald-400 tracking-tighter flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          AUTOLOAD_CMD
        </h1>
        <p className="text-xs text-slate-500 mt-1">Updater Management System</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950 rounded p-3 text-xs text-slate-500 font-mono">
          <div className="flex justify-between mb-1">
            <span>STATUS</span>
            <span className="text-emerald-500">ONLINE</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
            <div className="w-3/4 bg-emerald-500 h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
