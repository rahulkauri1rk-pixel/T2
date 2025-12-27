
import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  LayoutDashboard, FileText, User, LogOut, Search, RefreshCw, X, ArrowLeft, 
  MapPin, ClipboardList, Send, Loader2, Grid, Wrench, Landmark, StickyNote, 
  ShieldCheck, Database, ExternalLink, Map as MapIcon, Plus, Save, BarChart3, 
  Locate, ShieldAlert, Key, Link as LinkIcon, Cloud, Menu, Info, AlertTriangle
} from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { collection, addDoc, query, where, limit, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ExternalApp, PropertyRecord } from '../../types';

// --- Utility Components ---

const UnitConverterTool = ({ onBack }: { onBack: () => void }) => {
  const [amount, setAmount] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('Square Feet');
  const [toUnit, setToUnit] = useState<string>('Square Meter');
  const [result, setResult] = useState<string | null>(null);

  const conversionFactors: Record<string, number> = {
    'Square Feet': 1, 'Square Yard': 9, 'Square Meter': 10.76, 'Acre': 43560,
    'Hectare': 107639, 'Gaj': 9, 'Bigha (Pucca)': 27225, 'Ground': 2400
  };

  const handleConvert = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return;
    const res = (val * conversionFactors[fromUnit]) / conversionFactors[toUnit];
    setResult(`${val} ${fromUnit} = ${res.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${toUnit}`);
  };

  return (
    <div className="max-w-2xl animate-fade-in mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold uppercase text-[10px] tracking-widest group"><ArrowLeft size={18} /> Back to Hub</button>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4"><div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm"><RefreshCw size={24} /></div> Area Dimension Converter</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Input Value</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-6 py-5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-2xl font-black bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none">{Object.keys(conversionFactors).map(u => <option key={u} value={u}>{u}</option>)}</select>
                    <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none">{Object.keys(conversionFactors).map(u => <option key={u} value={u}>{u}</option>)}</select>
                </div>
                <button onClick={handleConvert} className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-black transition-all shadow-xl active:scale-95">Scale Geometry</button>
                {result && <div className="p-8 bg-primary text-white rounded-[2rem] font-black text-xl text-center shadow-2xl animate-fade-in">{result}</div>}
            </div>
        </div>
    </div>
  );
};

const MortgageTool = ({ onBack }: { onBack: () => void }) => {
    const [loan, setLoan] = useState('5000000');
    const [rate, setRate] = useState('8.5');
    const [tenure, setTenure] = useState('20');
    const [emi, setEmi] = useState<number | null>(null);

    const calculateEMI = () => {
        const p = parseFloat(loan);
        const r = parseFloat(rate) / 12 / 100;
        const n = parseFloat(tenure) * 12;
        const e = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmi(Math.round(e));
    };

    return (
        <div className="max-w-2xl animate-fade-in mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold uppercase text-[10px] tracking-widest group"><ArrowLeft size={18} /> Back</button>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm"><Landmark size={24} /></div> Institutional EMI Estimator</h3>
                <div className="space-y-6">
                    <input type="number" value={loan} onChange={e => setLoan(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-black text-xl bg-slate-50" placeholder="Loan Amount" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-black bg-slate-50" placeholder="Interest %" step="0.1" />
                        <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-black bg-slate-50" placeholder="Years" />
                    </div>
                    <button onClick={calculateEMI} className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] hover:bg-primary-dark transition-all shadow-2xl active:scale-95">Calculate Payment</button>
                    {emi !== null && (
                        <div className="p-10 bg-slate-900 text-white rounded-[2rem] text-center border-b-8 border-primary shadow-2xl">
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.4em] mb-1">Monthly Installment</div>
                            <div className="text-5xl font-black text-primary-light">₹{emi.toLocaleString('en-IN')}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotesTool = ({ onBack }: { onBack: () => void }) => {
    const [note, setNote] = useState('');
    const [savedNotes, setSavedNotes] = useState<string[]>(() => {
        const saved = localStorage.getItem('abs_survey_pad');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('abs_survey_pad', JSON.stringify(savedNotes)); }, [savedNotes]);

    const handleSave = () => { if (!note.trim()) return; setSavedNotes([note, ...savedNotes]); setNote(''); };

    return (
        <div className="max-w-2xl animate-fade-in mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold uppercase text-[10px] tracking-widest group"><ArrowLeft size={18} /> Back</button>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4"><div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm"><StickyNote size={26} /></div> Digital Survey Pad</h3>
                <textarea placeholder="Quick observations from the field..." rows={4} className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 outline-none font-medium mb-4" value={note} onChange={e => setNote(e.target.value)} />
                <button onClick={handleSave} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus size={20} /> Save Site Note</button>
                <div className="mt-8 space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {savedNotes.map((n, i) => <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">{n}</div>)}
                    {savedNotes.length === 0 && <p className="text-center text-slate-400 py-4 text-xs italic">No site notes captured.</p>}
                </div>
            </div>
        </div>
    );
};

const WorkLogView = ({ onBack }: { onBack: () => void }) => {
    const { user } = useSite();
    const [formData, setFormData] = useState({ name: '', reason: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!formData.reason.trim()) { alert("Please describe your activity."); return; }
        if (!user) { alert("Session expired. Please log in again."); return; }

        setLoading(true);
        try {
            // Collection name: 'daily_work_logs'
            await addDoc(collection(db, 'daily_work_logs'), { 
                name: formData.name || user.displayName || user.email?.split('@')[0],
                reason: formData.reason,
                userId: user.uid, 
                recordedBy: user.email?.toLowerCase(),
                timestamp: serverTimestamp(), 
                date: new Date().toLocaleDateString('en-IN') 
            });
            setFormData({ name: '', reason: '' });
            alert("SUCCESS: Activity committed to Ledger.");
            onBack();
        } catch (err: any) { 
            console.error("Ledger Sync Error:", err);
            setError("PERMISSION ERROR: The database rules prevented this submission. If you are the owner, please paste the rules from the Admin Panel into your Firebase Console.");
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl animate-fade-in mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold uppercase text-[10px] tracking-widest group"><ArrowLeft size={18} /> Back to Hub</button>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><ClipboardList size={26} /></div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Daily Work Log</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Digital Field Ledger</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl animate-fade-in">
                        <div className="flex gap-3 text-rose-600 mb-3">
                            <ShieldAlert className="shrink-0" size={20} />
                            <h4 className="font-black text-sm uppercase tracking-tight">Security Block</h4>
                        </div>
                        <p className="text-xs font-bold text-rose-700 leading-relaxed mb-4">{error}</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => window.open('https://console.firebase.google.com/')} target="_blank" className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"><ExternalLink size={12} /> Open Firebase Rules Console</button>
                            <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-1.5"><RefreshCw size={12} /> Refresh Identity Session</button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Surveyor Identity</label>
                        <input placeholder="Your Name / Staff ID" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Activity Summary</label>
                        <textarea placeholder="e.g. Conducted site survey at Kashipur Industrial Area..." rows={5} className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 outline-none font-medium focus:ring-4 focus:ring-primary/5 transition-all" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} Commit to Activity Ledger
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Survey Map Tool ---

const MarketDataTool = ({ onBack }: { onBack?: () => void }) => {
  const { user, userRole } = useSite();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const [activeSheet, setActiveSheet] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [records, setRecords] = useState<PropertyRecord[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const [formData, setFormData] = useState({ type: 'Residential', rate: '', areaName: 'Locating...', city: 'Locating...' });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !user) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([29.2104, 78.9619], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
    map.on('click', (e) => { setCurrentCoords(e.latlng); setActiveSheet(true); reverseGeocode(e.latlng.lat, e.latlng.lng); });
    mapRef.current = map;

    const isStaff = ['admin', 'super_admin', 'employee'].includes(userRole || '');
    const q = isStaff ? query(collection(db, 'market_intelligence'), orderBy('timestamp', 'desc'), limit(1000)) : query(collection(db, 'market_intelligence'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(1000));

    const unsub = onSnapshot(q, {
        next: (snapshot) => {
            setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyRecord)));
            setPermissionError(false);
        },
        error: (err) => {
            console.error("Market Tool Error:", err);
            if (err.code === 'permission-denied') setPermissionError(true);
        }
    });
    return () => { unsub(); map.remove(); mapRef.current = null; };
  }, [user, userRole]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const d = await r.json();
      const a = d.address || {};
      setFormData(prev => ({ ...prev, city: a.city || a.town || 'Unknown', areaName: a.suburb || a.road || 'Point Location' }));
    } catch { }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    (Object.values(markersRef.current) as L.CircleMarker[]).forEach(m => m.remove());
    markersRef.current = {};
    records.forEach(data => {
      if (mapRef.current) {
        const color = data.type === 'Commercial' ? '#3b82f6' : '#10b981';
        markersRef.current[data.id] = L.circleMarker([data.lat, data.lng], { radius: 10, color, fillColor: color, fillOpacity: 0.6, weight: 3 }).addTo(mapRef.current).bindPopup(`<strong>${data.type}</strong><br/>₹${data.rate}`);
      }
    });
  }, [records]);

  const saveRecord = async () => {
    if (!currentCoords || !formData.rate || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'market_intelligence'), { 
        ...formData, 
        lat: currentCoords.lat, 
        lng: currentCoords.lng, 
        recordedBy: user.email?.toLowerCase(), 
        userId: user.uid, 
        rate: parseFloat(formData.rate),
        timestamp: serverTimestamp() 
      });
      setActiveSheet(false);
    } catch (err) { alert("Submission Blocked: Verify permissions."); } finally { setIsSaving(false); }
  };

  if (permissionError) return (
    <div className="bg-white rounded-[3rem] p-16 text-center shadow-xl flex flex-col items-center justify-center animate-fade-in border border-slate-100">
        <div className="p-5 bg-rose-50 text-rose-500 rounded-3xl mb-6 animate-pulse"><ShieldAlert size={48} /></div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h3>
        <p className="text-slate-500 font-medium mb-8">Role authorization required to view rate feeds.</p>
        <button onClick={onBack} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black">Back to Hub</button>
    </div>
  );

  return (
    <div className="relative w-full h-[600px] md:h-[calc(100vh-200px)] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 animate-fade-in">
      <div className="absolute top-6 left-6 z-[100] flex gap-2">
        {onBack && <button onClick={onBack} className="p-4 bg-white text-slate-800 rounded-2xl shadow-xl transition-all hover:bg-slate-50"><ArrowLeft size={20} /></button>}
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100"><BarChart3 className="text-primary" size={20} /><span className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Survey Terminal</span></div>
      </div>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-10 right-10 z-[100] flex flex-col gap-4">
          <button onClick={() => { navigator.geolocation.getCurrentPosition(p => mapRef.current?.flyTo([p.coords.latitude, p.coords.longitude], 16)) }} className="w-14 h-14 bg-white text-slate-800 rounded-2xl shadow-2xl flex items-center justify-center hover:bg-slate-50 border border-slate-200 transition-all"><Locate size={24} /></button>
          <button onClick={() => setActiveSheet(true)} className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-primary/30"><Plus size={32} /></button>
      </div>
      {activeSheet && (
          <div className="absolute inset-0 z-[6000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
              <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl animate-fade-in-up">
                  <h4 className="text-slate-950 font-black text-3xl tracking-tighter mb-1">Log Survey</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-8">{formData.areaName}</p>
                  <div className="space-y-6">
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none font-bold text-sm">
                            <option>Residential</option><option>Commercial</option><option>Industrial</option>
                      </select>
                      <input type="number" placeholder="Rate / sqft" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-slate-100 outline-none font-black text-2xl" />
                      <button onClick={saveRecord} disabled={isSaving} className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-3xl font-black text-lg shadow-2xl transition-all shadow-primary/20">
                        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Synchronize Data'}
                      </button>
                      <button onClick={() => setActiveSheet(false)} className="w-full text-slate-400 font-bold hover:text-slate-900">Discard</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// --- Views ---

const UserAppsView = ({ onLaunch }: { onLaunch: (id: string) => void }) => {
    const { userRole } = useSite();
    const [externalApps, setExternalApps] = useState<ExternalApp[]>([]);
    const [permissionError, setPermissionError] = useState(false);
    const isStaff = ['super_admin', 'admin', 'employee'].includes(userRole || '');
    
    useEffect(() => {
        const q = query(collection(db, 'external_apps'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, {
            next: (snap) => {
                setExternalApps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExternalApp)));
                setPermissionError(false);
            },
            error: (err) => {
                if (err.code === 'permission-denied') setPermissionError(true);
            }
        });
        return () => unsub();
    }, []);

    const systemApps = [{ id: 'work-log', name: 'Activity Log', icon: ClipboardList, color: 'bg-blue-600', desc: 'Institutional log for site visits.' }];
    if (isStaff) systemApps.push({ id: 'market-data', name: 'Intelligence', icon: BarChart3, color: 'bg-primary', desc: 'Real-time property rate mapping.' });
    
    return (
        <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {systemApps.map(app => (
                    <div key={app.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
                        <div className={`w-16 h-16 rounded-[1.25rem] ${app.color} text-white flex items-center justify-center mb-8 shadow-xl group-hover:rotate-6 transition-transform`}><app.icon size={32} /></div>
                        <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{app.name}</h4>
                        <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">{app.desc}</p>
                        <button onClick={() => onLaunch(app.id)} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">Open Module</button>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3"><div className="w-1.5 h-6 bg-primary rounded-full"></div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Connections</h4></div>
                {permissionError ? (
                    <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 text-center text-slate-400 italic">Syncing external extensions...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {externalApps.map(app => (
                            <div key={app.id} className="bg-white/50 backdrop-blur-sm p-10 rounded-[3.5rem] border border-slate-200/50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                <div className="absolute top-6 right-6 text-slate-200 group-hover:text-primary transition-colors"><Cloud size={32} /></div>
                                <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 text-slate-400 flex items-center justify-center mb-8 shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-all"><LinkIcon size={32} /></div>
                                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{app.name}</h4>
                                <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium h-10 overflow-hidden line-clamp-2">{app.description}</p>
                                <a href={app.url} target="_blank" rel="noreferrer" className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">Launch Terminal <ExternalLink size={14} /></a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const UserToolsView = ({ onLaunch }: { onLaunch: (id: string) => void }) => {
    const tools = [
        { id: 'converter', name: 'Unit Converter', icon: RefreshCw, color: 'bg-orange-500', desc: 'Precision land area scaling utility.' },
        { id: 'mortgage', name: 'EMI Estimator', icon: Landmark, color: 'bg-emerald-600', desc: 'Institutional loan calculation tool.' },
        { id: 'notes', name: 'Survey Pad', icon: StickyNote, color: 'bg-purple-600', desc: 'Rapid field observation documentation.' }
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {tools.map(t => (
                <div key={t.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
                    <div className={`w-16 h-16 rounded-[1.25rem] ${t.color} text-white flex items-center justify-center mb-8 shadow-xl`}><t.icon size={32} /></div>
                    <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{t.name}</h4>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">{t.desc}</p>
                    <button onClick={() => onLaunch(t.id)} className="w-full py-4 bg-slate-100 text-slate-700 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">Launch Utility</button>
                </div>
            ))}
        </div>
    );
};

// --- Main Layout ---

const UserDashboard: React.FC = () => {
    const { logout, user, userRole } = useSite();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isStaff = ['super_admin', 'admin', 'employee'].includes(userRole || '');

    const renderContent = () => {
        if (activeTab === 'market-intelligence') return <MarketDataTool onBack={() => setActiveTab('dashboard')} />;
        if (activeTab === 'apps') {
            if (activeApp === 'work-log') return <WorkLogView onBack={() => setActiveApp(null)} />;
            if (activeApp === 'market-data') return <MarketDataTool onBack={() => setActiveApp(null)} />;
            return <UserAppsView onLaunch={setActiveApp} />;
        }
        if (activeTab === 'tools') {
            if (activeApp === 'converter') return <UnitConverterTool onBack={() => setActiveApp(null)} />;
            if (activeApp === 'mortgage') return <MortgageTool onBack={() => setActiveApp(null)} />;
            if (activeApp === 'notes') return <NotesTool onBack={() => setActiveApp(null)} />;
            return <UserToolsView onLaunch={setActiveApp} />;
        }
        switch (activeTab) {
            case 'dashboard': return (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-slate-900 p-16 rounded-[4.5rem] text-white shadow-2xl col-span-1 lg:col-span-2 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black mb-6 tracking-tighter">Welcome, {user?.displayName?.split(' ')[0] || 'Professional'}</h3>
                                <p className="text-slate-400 mb-12 text-xl font-light leading-relaxed max-w-lg">Institutional workspace active. Property intelligence and activity logs are synchronized.</p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => { setActiveTab('apps'); setActiveApp('work-log'); }} className="bg-primary text-white px-10 py-5 rounded-[2rem] font-bold shadow-2xl text-sm flex items-center gap-2 hover:scale-105 transition-transform"><ClipboardList size={18} /> Daily Work Log</button>
                                    {isStaff && <button onClick={() => setActiveTab('market-intelligence')} className="bg-white/10 text-white px-10 py-5 rounded-[2rem] font-bold backdrop-blur-md transition-all text-sm border border-white/10 hover:bg-white/20 flex items-center gap-2"><MapPin size={18} /> Market Map</button>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center text-center">
                            <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem] mb-6 shadow-sm"><ShieldCheck size={40} /></div>
                            <div className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.4em]">Verified Identity</div>
                            <div className="text-2xl font-black text-slate-900 capitalize tracking-tighter">{userRole || 'Client'}</div>
                            <div className="mt-6 px-4 py-2 bg-emerald-50 rounded-full text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Secure</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all" onClick={() => setActiveTab('apps')}>
                            <div className="flex items-center gap-6"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Grid size={32} /></div><div><h4 className="text-2xl font-black text-slate-900">App Gallery</h4><p className="text-slate-400 text-sm font-medium">Work Logs & Intelligence</p></div></div>
                            <div className="p-4 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors"><Plus size={24} /></div>
                        </div>
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all" onClick={() => setActiveTab('tools')}>
                            <div className="flex items-center gap-6"><div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Wrench size={32} /></div><div><h4 className="text-2xl font-black text-slate-900">Utility Hub</h4><p className="text-slate-400 text-sm font-medium">Dimension & EMI Tools</p></div></div>
                            <div className="p-4 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors"><Plus size={24} /></div>
                        </div>
                    </div>
                </div>
            );
            case 'profile': return (
                <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl max-w-3xl animate-fade-in mx-auto mt-10">
                    <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-primary to-blue-800 text-white flex items-center justify-center text-5xl font-black mx-auto mb-8 shadow-2xl border-8 border-white">{user?.email?.[0].toUpperCase()}</div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter text-center">{user?.displayName || 'ABS Professional'}</h3>
                    <p className="text-slate-400 font-bold text-center mt-2 uppercase text-xs">{user?.email}</p>
                    <div className="mt-12 flex flex-col gap-4"><button onClick={logout} className="w-full flex items-center justify-center gap-3 text-rose-500 border-2 border-rose-50 hover:bg-rose-50 py-5 rounded-[2rem] font-black transition-all text-sm uppercase tracking-widest"><LogOut size={18} /> Close Workspace</button></div>
                </div>
            );
            default: return null;
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Work Overview', icon: LayoutDashboard },
        { id: 'apps', label: 'App Gallery', icon: Grid },
        { id: 'tools', label: 'Utilities', icon: Wrench },
        { id: 'profile', label: 'Account Identity', icon: User },
    ];
    if (isStaff) navItems.splice(2, 0, { id: 'market-intelligence', label: 'Intelligence Map', icon: MapIcon });

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
            {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-400 transform ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-500 flex flex-col border-r border-white/5`}>
                <div className="p-10 border-b border-white/5 flex flex-col gap-1 relative"><h2 className="text-white text-2xl font-black tracking-tighter">ABS <span className="text-primary font-normal">Panel</span></h2><div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Institutional Interface</div></div>
                <nav className="flex-1 p-6 space-y-2 mt-4 custom-scrollbar">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setActiveApp(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] transition-all group ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 hover:text-white'}`}>
                            <item.icon size={18} className={activeTab === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} />
                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-white/5"><button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 font-bold text-sm transition-all group"><LogOut size={18} /><span>End Workspace</span></button></div>
            </aside>
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-30 shadow-sm"><button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 bg-slate-100 rounded-2xl text-slate-600"><Menu size={24} /></button><h1 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">{activeApp ? activeApp.replace('-', ' ') : activeTab.replace('-', ' ')}</h1><div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center text-white font-black text-xl shadow-2xl border-4 border-white">{user?.email?.[0].toUpperCase()}</div></header>
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-50/30 custom-scrollbar"><div className="max-w-7xl mx-auto">{renderContent()}</div></div>
            </main>
        </div>
    );
};

export default UserDashboard;
