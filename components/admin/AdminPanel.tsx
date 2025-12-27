
import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  LayoutDashboard, FileText, Settings, BarChart3, Globe, Shield, LogOut, Save, RefreshCw, 
  Users, Search, Trash2, ExternalLink, Grid, Menu, X, ArrowLeft, History, Database, 
  Loader2, MapPin, ClipboardList, Copy, ShieldCheck, Mail, Link as LinkIcon, Lock, Code,
  CheckCircle2, Plus, FilterX, UserCog, DatabaseBackup, TrendingUp, Box, ShieldAlert,
  Calendar, UserCheck, AlertTriangle, Monitor, Landmark
} from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { db } from '../../lib/firebase';
import { collection, doc, deleteDoc, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ExternalApp, PropertyRecord } from '../../types';

// --- Shared Utility Components ---

const PermissionDenied = ({ message, target }: { message: string, target: string }) => (
    <div className="bg-white rounded-[3rem] border border-rose-100 p-16 text-center flex flex-col items-center justify-center animate-fade-in shadow-2xl shadow-rose-500/5">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-inner">
            <ShieldAlert size={48} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Access Restricted</h3>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-6 font-medium">{message}</p>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-10 text-left flex gap-3 max-w-md">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[11px] text-amber-700 leading-relaxed font-bold">If you are the owner, ensure your email is added to the "user_permissions" collection with role "admin" in the Firebase Console.</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl">
            <RefreshCw size={18} /> Re-sync Identity
        </button>
    </div>
);

// --- Site Editor ---
const SiteEditor = () => {
    const { config, updateConfig, resetConfig } = useSite();
    const [newBank, setNewBank] = useState('');

    const handleStatChange = (key: string, value: string) => {
        updateConfig('stats', { [key]: parseInt(value) || 0 });
    };

    const handleHeroChange = (key: string, value: string) => {
        updateConfig('hero', { [key]: value });
    };

    const addBank = () => {
        if (!newBank.trim()) return;
        updateConfig('banks', [...config.banks, newBank.trim()]);
        setNewBank('');
    };

    const removeBank = (bankToRemove: string) => {
        updateConfig('banks', config.banks.filter(b => b !== bankToRemove));
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Hero Section Editor */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Monitor size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900">Hero Content</h3>
                        <p className="text-slate-400 font-medium">Manage the first thing users see</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Badge Label</label>
                        <input value={config.hero.badge} onChange={e => handleHeroChange('badge', e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title Line 1</label>
                        <input value={config.hero.titleLine1} onChange={e => handleHeroChange('titleLine1', e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title Line 2</label>
                        <input value={config.hero.titleLine2} onChange={e => handleHeroChange('titleLine2', e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Background Image URL</label>
                        <input value={config.hero.backgroundImage} onChange={e => handleHeroChange('backgroundImage', e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold" />
                    </div>
                    <div className="col-span-full space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                        <textarea value={config.hero.description} onChange={e => handleHeroChange('description', e.target.value)} rows={3} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium" />
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600"><TrendingUp size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900">Performance Stats</h3>
                        <p className="text-slate-400 font-medium">Update the public-facing counters</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Years Experience</label>
                        <input type="number" value={config.stats.years} onChange={e => handleStatChange('years', e.target.value)} className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-100 font-black text-2xl text-primary" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Properties Valued</label>
                        <input type="number" value={config.stats.properties} onChange={e => handleStatChange('properties', e.target.value)} className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-100 font-black text-2xl text-primary" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Happy Clients</label>
                        <input type="number" value={config.stats.clients} onChange={e => handleStatChange('clients', e.target.value)} className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-100 font-black text-2xl text-primary" />
                    </div>
                </div>
            </div>

            {/* Bank Partners Manager */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-orange-100 rounded-2xl text-orange-600"><Landmark size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900">Institutional Partners</h3>
                        <p className="text-slate-400 font-medium">Manage the bank empanelment list</p>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-10">
                    <input 
                        value={newBank} 
                        onChange={e => setNewBank(e.target.value)} 
                        placeholder="Add new partner bank..." 
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                    />
                    <button onClick={addBank} className="px-10 bg-primary text-white rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        <Plus size={20} /> Add
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {config.banks.map((bank, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                            <span className="text-xs font-bold text-slate-700">{bank}</span>
                            <button onClick={() => removeBank(bank)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-10">
                <button onClick={resetConfig} className="text-slate-400 font-bold hover:text-rose-500 flex items-center gap-2 transition-colors">
                    <RefreshCw size={18} /> Reset to Factory Defaults
                </button>
            </div>
        </div>
    );
};

// --- App Directory Manager ---
const AppDirectory = () => {
    const [apps, setApps] = useState<ExternalApp[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [formData, setFormData] = useState({ name: '', url: '', description: '', category: 'Utility' });

    useEffect(() => {
        const q = query(collection(db, 'external_apps'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, {
            next: (snap) => {
                setApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExternalApp)));
                setPermissionError(false);
            },
            error: (err) => {
                if (err.code === 'permission-denied') setPermissionError(true);
            }
        });
        return () => unsub();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url) return;
        setIsAdding(true);
        try {
            await addDoc(collection(db, 'external_apps'), {
                ...formData,
                createdAt: serverTimestamp()
            });
            setFormData({ name: '', url: '', description: '', category: 'Utility' });
        } catch (err: any) {
            alert("Action Blocked: Check Admin Matrix permissions.");
        } finally {
            setIsAdding(false);
        }
    };

    if (permissionError) return <PermissionDenied target="App Directory" message="Administrative privileges required to modify external connections." />;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary"><LinkIcon size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900">App Directory</h3>
                        <p className="text-slate-400 font-medium">Curate dashboard links for the field team</p>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="App Label" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" />
                    <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium" />
                    <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Purpose" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium" />
                    <button type="submit" disabled={isAdding} className="bg-primary text-white py-4.5 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        {isAdding ? <Loader2 className="animate-spin mx-auto" /> : 'Deploy Link'}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {apps.map(app => (
                    <div key={app.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-slate-50 text-slate-400 rounded-xl"><LinkIcon size={24} /></div>
                            <button onClick={() => deleteDoc(doc(db, 'external_apps', app.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">{app.name}</h4>
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed line-clamp-2 mb-6">{app.description}</p>
                        <a href={app.url} target="_blank" rel="noreferrer" className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:underline">Launch Site <ExternalLink size={12} /></a>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Staff Activity Ledger ---
const StaffActivityLedger = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'daily_work_logs'), orderBy('timestamp', 'desc'), limit(200));
        const unsub = onSnapshot(q, {
            next: (snap) => {
                setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
                setPermissionError(false);
            },
            error: (err) => {
                console.error("Ledger Sync Error:", err);
                if (err.code === 'permission-denied') setPermissionError(true);
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    if (permissionError) return <PermissionDenied target="Activity Ledger" message="Administrator access is required to view the staff work history ledger." />;

    return (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Staff Activity Ledger</h3>
                    <p className="text-slate-500 text-sm font-medium">Real-time daily field work synchronization</p>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><ClipboardList size={28} /></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                        <tr><th className="px-10 py-6">Staff Member</th><th className="px-8 py-6">Date</th><th className="px-8 py-6">Work Details</th><th className="px-10 py-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></td></tr> : logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-10 py-6"><div className="font-black text-slate-800">{log.name || 'Unknown'}</div><div className="text-[10px] text-slate-400 font-bold">{log.recordedBy}</div></td>
                                <td className="px-8 py-6 font-bold text-slate-500 text-sm">{log.date || 'Today'}</td>
                                <td className="px-8 py-6"><p className="text-slate-600 text-sm font-medium leading-relaxed max-w-lg">{log.reason}</p></td>
                                <td className="px-10 py-6 text-right"><button onClick={() => deleteDoc(doc(db, 'daily_work_logs', log.id))} className="p-3 text-rose-300 hover:text-rose-600 transition-all"><Trash2 size={18} /></button></td>
                            </tr>
                        ))}
                        {!loading && logs.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">No work logs submitted yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Market History Feed ---
const MarketHistoryFeed = () => {
    const [entries, setEntries] = useState<PropertyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'market_intelligence'), orderBy('timestamp', 'desc'), limit(100));
        const unsub = onSnapshot(q, {
            next: (snap) => {
                setEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyRecord)));
                setLoading(false);
            },
            error: (err) => {
                if (err.code === 'permission-denied') setPermissionError(true);
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    if (permissionError) return <PermissionDenied target="Intelligence Feed" message="Verified admin status required for survey data access." />;

    const filtered = entries.filter(e => e.areaName?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-6 bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Market Intelligence</h3>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter area..." className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                        <tr><th className="px-10 py-6">Area</th><th className="px-8 py-6">Type</th><th className="px-8 py-6">Rate (₹)</th><th className="px-8 py-6">Recorded By</th><th className="px-10 py-6 text-right">Map</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></td></tr> : filtered.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-10 py-6"><div className="font-black text-slate-800">{e.areaName}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{e.city}</div></td>
                                <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{e.type}</span></td>
                                <td className="px-8 py-6 font-black text-blue-600 text-xl">₹{e.rate.toLocaleString()}</td>
                                <td className="px-8 py-6 text-xs font-bold text-slate-500">{e.recordedBy?.split('@')[0]}</td>
                                <td className="px-10 py-6 text-right"><button onClick={() => window.open(`https://maps.google.com/?q=${e.lat},${e.lng}`)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><MapPin size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Security Kernel ---
const SecurityKernel = () => {
    const rulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/user_permissions/$(request.auth.token.email.lower())) &&
        get(/databases/$(database)/documents/user_permissions/$(request.auth.token.email.lower())).data.role in ['admin', 'super_admin'];
    }

    match /daily_work_logs/{docId} {
      allow read: if isAdmin();
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    match /market_intelligence/{docId} {
      allow read: if isAdmin() || 
        (request.auth != null && exists(/databases/$(database)/documents/user_permissions/$(request.auth.token.email.lower())) && 
         get(/databases/$(database)/documents/user_permissions/$(request.auth.token.email.lower())).data.role == 'employee') ||
        (request.auth != null && resource.data.userId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    match /user_permissions/{email} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.token.email.lower() == email.lower();
      allow update: if request.auth != null && (request.auth.token.email.lower() == email.lower() || isAdmin());
      allow delete: if isAdmin();
    }

    match /external_apps/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}`;

    const [copied, setCopied] = useState(false);
    const copyRules = () => {
        navigator.clipboard.writeText(rulesSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6"><div className="p-4 bg-primary/20 rounded-2xl text-primary"><Shield size={32} /></div><div><h3 className="text-4xl font-black">Security Kernel</h3><p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Institutional Ruleset</p></div></div>
                    <p className="text-slate-400 mb-10 max-w-2xl font-medium leading-relaxed">Mandatory step: Copy and paste these rules into the <span className="text-white underline">Firebase Rules Console</span> to fix permission-denied errors.</p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={copyRules} className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black flex items-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                            {copied ? <CheckCircle2 size={20} className="text-white" /> : <Copy size={20} />} 
                            {copied ? 'Logic Copied' : 'Copy Rules'}
                        </button>
                        <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="px-10 py-5 bg-white/10 text-white rounded-[1.5rem] border border-white/10 font-black flex items-center gap-2 hover:bg-white/20 transition-all">
                            <ExternalLink size={20} /> Open Console
                        </a>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="font-black text-xs text-slate-400 tracking-widest uppercase">Kernel Source v1.8</div>
                    <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">Live Protection</div>
                </div>
                <div className="p-12 bg-slate-950 overflow-x-auto custom-scrollbar"><pre className="text-emerald-400 font-mono text-[13px] leading-relaxed">{rulesSnippet}</pre></div>
            </div>
        </div>
    );
};

const UsersManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'user_permissions'), orderBy('email', 'asc'));
        const unsub = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const updateRole = async (email: string, role: string) => {
        try {
            await updateDoc(doc(db, 'user_permissions', email.toLowerCase().trim()), { role });
        } catch (e) { alert("Matrix Error: Check Security Kernel."); }
    };

    return (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Access Matrix</h3>
                <p className="text-slate-500 text-sm font-medium">Escalate staff roles to enable surveying modules</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-10 py-6"><div className="font-black text-slate-900 text-lg">{u.displayName}</div><div className="text-[11px] text-slate-400 font-bold">{u.email}</div></td>
                                <td className="px-10 py-6">
                                    <select disabled={u.role === 'super_admin'} value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase">
                                        <option value="client">Client</option>
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-10 py-6 text-right"><button onClick={() => deleteDoc(doc(db, 'user_permissions', u.id))} disabled={u.role === 'super_admin'} className="p-3 text-rose-300 hover:text-rose-600 transition-colors"><ShieldCheck size={20} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminPanel: React.FC = () => {
  const { logout } = useSite();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'market-entries' | 'work-logs' | 'users' | 'security' | 'app-directory' | 'site-settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Executive Core', icon: LayoutDashboard },
    { id: 'site-settings', label: 'Site Editor', icon: Settings },
    { id: 'market-entries', label: 'Field History', icon: Database },
    { id: 'work-logs', label: 'Activity Ledger', icon: ClipboardList },
    { id: 'users', label: 'Access Matrix', icon: UserCog }, 
    { id: 'app-directory', label: 'App Manager', icon: LinkIcon },
    { id: 'security', label: 'Security Kernel', icon: ShieldCheck },
  ];

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard': return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"><div className="p-4 bg-blue-50 text-primary rounded-2xl w-fit mb-6"><ClipboardList size={32} /></div><div className="text-4xl font-black text-slate-900">Activity</div><p className="text-slate-400 text-sm mt-2 mb-8">Monitor daily staff field logs and site visits.</p><button onClick={() => setActiveTab('work-logs')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">View Ledger</button></div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6"><Database size={32} /></div><div className="text-4xl font-black text-slate-900">Intelligence</div><p className="text-slate-400 text-sm mt-2 mb-8">Review verified property rates from surveyors.</p><button onClick={() => setActiveTab('market-entries')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Open Feed</button></div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"><div className="p-4 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-6"><UserCog size={32} /></div><div className="text-4xl font-black text-slate-900">Matrix</div><p className="text-slate-400 text-sm mt-2 mb-8">Provision staff permissions and role hierarchies.</p><button onClick={() => setActiveTab('users')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Open Matrix</button></div>
              </div>
          );
          case 'site-settings': return <SiteEditor />;
          case 'work-logs': return <StaffActivityLedger />;
          case 'users': return <UsersManager />;
          case 'app-directory': return <AppDirectory />;
          case 'security': return <SecurityKernel />;
          case 'market-entries': return <MarketHistoryFeed />;
          default: return <div className="text-center py-20 text-slate-400 font-bold">Synchronizing Terminal...</div>;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative">
      <aside className={`w-80 bg-slate-900 text-slate-400 fixed md:static inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 transition-transform duration-500 z-50 flex flex-col border-r border-white/5`}>
        <div className="p-12 border-b border-white/5 flex flex-col gap-1"><h2 className="text-white text-3xl font-black tracking-tighter">ABS <span className="text-primary font-normal">Panel</span></h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Console</div></div>
        <nav className="flex-1 p-8 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-2xl' : 'hover:bg-white/5 hover:text-white'}`}>
                    <item.icon size={20} className={activeTab === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </button>
            ))}
        </nav>
        <div className="p-8 border-t border-white/5"><button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 font-bold text-sm transition-all"><LogOut size={18} /><span>End Workspace</span></button></div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 shrink-0 z-30 shadow-sm">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 bg-slate-100 rounded-xl text-slate-600"><Menu size={24} /></button>
            <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">{activeTab.replace('-', ' ')}</h1>
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg">A</div>
        </header>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 relative custom-scrollbar"><div className="max-w-7xl mx-auto pb-20">{renderContent()}</div></div>
      </main>
    </div>
  );
};

export default AdminPanel;
