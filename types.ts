
import React from 'react';

export interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface TestimonialItem {
  text: string;
  author: string;
  role: string;
  initials: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  groundingChunks?: any[]; 
}

// --- Admin & Professional Ecosystem Types ---

export interface ExternalApp {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdAt: any;
}

export interface PropertyRecord {
  id: string;
  lat: number;
  lng: number;
  type: string;
  rate: number;
  areaName: string;
  city: string;
  recordedBy: string;
  userId: string;
  timestamp: any;
}

export interface HeroConfig {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  backgroundImage: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
}

export interface ThemeConfig {
  primaryColor: string;
  darkMode: boolean;
}

export interface SocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  googleMapsLink: string;
  socials: SocialLinks;
}

export interface SiteStats {
  years: number;
  properties: number;
  clients: number;
}

export interface SiteFeatures {
  enableAI: boolean;
  showTestimonials: boolean;
}

export interface SiteConfig {
  hero: HeroConfig;
  seo: SeoConfig;
  theme: ThemeConfig;
  contact: ContactInfo;
  features: SiteFeatures;
  stats: SiteStats;
  banks: string[];
}
