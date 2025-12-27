
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// Helper to adjust color brightness
function adjustColor(hex: string, percent: number) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.floor(R * (1 + percent / 100));
    G = Math.floor(G * (1 + percent / 100));
    B = Math.floor(B * (1 + percent / 100));

    R = (R < 255) ? R : 255;  
    G = (G < 255) ? G : 255;  
    B = (B < 255) ? B : 255;  

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

const defaultConfig: SiteConfig = {
  hero: {
    badge: 'IBBI Registered Valuer',
    titleLine1: 'Precision in Every',
    titleLine2: 'Valuation',
    description: 'Professional surveyors delivering accurate valuations and expert property advice. Trusted by homeowners and investors for over 20 years.',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1800&q=80'
  },
  seo: {
    title: 'Aaditya Building Solution | Professional Surveying & Valuation',
    description: 'Professional IBBI Registered Valuers offering residential & commercial valuations.',
    keywords: 'surveyors, valuers, IBBI, property valuation, building survey'
  },
  theme: {
    primaryColor: '#2563eb',
    darkMode: false
  },
  contact: {
    phone: '+91 98371 79179',
    email: 'vr.arpitagarwal@gmail.com',
    address: 'Santoshi Mata Mandir Wali Gali, Cheema Chauraha, Ramnagar Road, Kashipur, Uttarakhand',
    googleMapsLink: 'https://maps.google.com/?q=Santoshi+Mata+Mandir+Wali+Gali+Cheema+Chauraha+Kashipur',
    socials: {
      facebook: '#',
      twitter: '#',
      linkedin: '#',
      instagram: '#'
    }
  },
  features: {
    enableAI: true,
    showTestimonials: true
  },
  stats: {
    years: 20,
    properties: 5000,
    clients: 1000
  },
  banks: [
    "Bank of Baroda", "Bank of India", "Indian Bank", "Bank of Maharashtra",
    "Punjab National Bank", "Indian Overseas Bank", "UCO Bank", "Canara Bank",
    "Uttarakhand Gramin Bank", "State Bank of India", "U.S. Nagar Distt Cooperative Bank",
    "Yes Bank", "Kashipur Urban Cooperative Bank", "Axis Bank", "Jammu & Kashmir Bank",
    "Nainital Bank"
  ]
};

export type UserRole = 'super_admin' | 'admin' | 'employee' | 'client' | null;

interface SiteContextType {
  config: SiteConfig;
  updateConfig: (section: keyof SiteConfig, data: any) => void;
  resetConfig: () => void;
  isAdmin: boolean;
  userRole: UserRole;
  user: User | null;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setIsAdmin: (value: boolean) => void; 
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('abs_site_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default to ensure new fields are present
      return { ...defaultConfig, ...parsed };
    }
    return defaultConfig;
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeRole: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeRole) {
        unsubscribeRole();
        unsubscribeRole = null;
      }

      if (currentUser && currentUser.email) {
        const email = currentUser.email.toLowerCase();
        const permRef = doc(db, 'user_permissions', email);
        
        unsubscribeRole = onSnapshot(permRef, {
            next: (docSnap) => {
                if (docSnap.exists()) {
                    setUserRole(docSnap.data().role as UserRole);
                } else {
                    // Fail-safe: Auto-create client role for new users
                    setDoc(permRef, {
                        role: 'client',
                        uid: currentUser.uid,
                        email: email,
                        displayName: currentUser.displayName || email.split('@')[0],
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp()
                    }, { merge: true }).catch(() => {
                        console.warn("Permission propagation in progress...");
                    });
                    setUserRole('client');
                }
            },
            error: (err) => {
                // Handle initial permission lag gracefully
                console.warn("Security synchronization pending...");
                setUserRole('client');
            }
        });

        await setDoc(permRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(() => {});
      } else {
        setUserRole(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('abs_site_config', JSON.stringify(config));
    document.title = config.seo.title;
    
    const root = document.documentElement;
    const primary = config.theme.primaryColor;
    const light = adjustColor(primary, 40);
    const dark = adjustColor(primary, -30);
    
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-light', light);
    root.style.setProperty('--color-primary-dark', dark);
  }, [config]);

  const updateConfig = (section: keyof SiteConfig, data: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: Array.isArray(data) ? data : { ...prev[section], ...data }
    }));
  };

  const resetConfig = () => setConfig(defaultConfig);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const isAdmin = !!user && (['super_admin', 'admin'].includes(userRole || ''));

  const setIsAdmin = (val: boolean) => {
      if (!val) logout();
      else openLoginModal();
  };

  return (
    <SiteContext.Provider value={{ 
        config, updateConfig, resetConfig, isAdmin, userRole, user, 
        logout, isLoginModalOpen, openLoginModal, closeLoginModal, setIsAdmin
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) throw new Error('useSite must be used within a SiteProvider');
  return context;
};
