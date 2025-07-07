import React, { useState, useEffect, useRef } from 'react';
import { useTypewriter } from 'react-simple-typewriter';
import { Link as ScrollLink } from 'react-scroll';
import apiClient from '../services/apiClient';
import type { AuthCheckRequest, AuthCheckResponse } from '../types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
// Placeholder: swap with your own confetti file at this path
import confettiAnimation from '../assets/confetti.json';

interface LandingPageProps {
  onComplete: () => void;
}

interface SubscribeRequest {
  email: string;
  first_name: string;
  last_name: string;
  company: string;
}

interface SubscribeResponse {
  id: string;
  email: string;
  status: string;
  success: boolean;
  message: string;
  error?: string;
}

const ROLE_OPTIONS = [
  'D2C / Indie Brand Founder',
  'Freelance Formulator / Chemist',
  'Contract Manufacturer / Private Label',
  'Product Manager / R&D at FMCG Company',
  'Growth Marketer / Brand Strategist',
  'Biohacker / Functional Wellness Creator',
  'Student / Researcher / DIY Enthusiast',
  'Ingredient Supplier or Distributor',
  'Packaging / Label Consultant',
  'Accelerator / Investor / Brand Studio',
  'Just exploring',
];

export default function LandingPage({ onComplete }: LandingPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [role, setRole] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardVisible, setCardVisible] = useState(false);

  // Typewriter effect for headline
  const [text] = useTypewriter({
    words: ['Make it yours from scrtch!'],
    loop: 1,
    typeSpeed: 100,
    deleteSpeed: 50,
  });

  // Show tooltip after 1 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tooltipDismissed) {
        setShowTooltip(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tooltipDismissed]);

  useEffect(() => {
    setCardVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        role,
      };
      const response = await apiClient.post<SubscribeResponse>('/mailchimp/subscribe', payload);
      
      if (response.data.success) {
        localStorage.setItem('subscriberEmail', formData.email.toLowerCase());
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          setSuccess(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 2200);
      } else {
        setError(response.data.error || 'Failed to subscribe');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to subscribe';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToFormulation = async () => {
    const storedEmail = localStorage.getItem('subscriberEmail');
    
    if (!storedEmail) {
      setError('Please subscribe first to access the formulation platform.');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const request: AuthCheckRequest = { email: storedEmail };
      const response = await apiClient.post<AuthCheckResponse>('/auth/check', request);
      
      if (response.data.subscribed) {
        // User is subscribed, proceed to formulation
        onComplete();
      } else {
        // User is not subscribed, clear stored email and show error
        localStorage.removeItem('subscriberEmail');
        setError('Your subscription has expired. Please subscribe again to access the platform.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to verify subscription';
      setError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const dismissTooltip = () => {
    setShowTooltip(false);
    setTooltipDismissed(true);
  };

  const isFormValid = formData.email && formData.first_name && formData.company && role;
  const hasStoredEmail = localStorage.getItem('subscriberEmail');

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
            <p className="text-gray-600">You're now subscribed to our newsletter. Redirecting to the platform...</p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Logo - Top Left Corner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-6 left-6 z-50"
      >
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-lg">
          {/* Logo Icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 relative"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="url(#logoGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="url(#logoGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="url(#logoGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          
          {/* Logo Text */}
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              scrtch
            </span>
            <span className="text-xl font-bold text-white ml-1">.ai</span>
          </div>
        </div>
      </motion.div>

      {/* Social Media Links - Floating Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        className="absolute bottom-6 right-6 z-50"
      >
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
          {/* LinkedIn */}
          <motion.a
            href="https://linkedin.com/company/scrtch-ai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/20 hover:bg-blue-600/30 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </motion.a>

          {/* Instagram */}
          <motion.a
            href="https://instagram.com/scrtch.ai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.875-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
            </svg>
          </motion.a>

          {/* X (Twitter) */}
          <motion.a
            href="https://x.com/scrtch_ai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </motion.a>

          {/* Substack */}
          <motion.a
            href="https://scrtch.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-600/20 hover:bg-orange-600/30 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
            </svg>
          </motion.a>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-purple-700 to-pink-500 flex items-center justify-center px-4 overflow-hidden">

        {/* Dynamic Tooltip */}
        {showTooltip && (
          <div className="absolute top-8 right-8 max-w-xs bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">
                  Did you know? Our engine can suggest ingredient substitutions in &lt; 2 seconds.
                </p>
              </div>
              <button
                onClick={dismissTooltip}
                className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Dismiss tooltip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Typewriter Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {text}
            <span className="animate-pulse">|</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-gray-100 mt-4 mb-8 max-w-2xl mx-auto leading-relaxed">
            Imagine having an R&D, Compliance, Marketing and Branding team - All in one intutive engine. Join our beta to experience it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA Button */}
            <ScrollLink
              to="beta-form"
              smooth={true}
              duration={800}
              offset={-20}
              className="inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              aria-label="Request beta access"
            >
              Request My Spot
            </ScrollLink>

            {/* Go to Formulation Button (only show if user has stored email) */}
            {hasStoredEmail && (
              <button
                onClick={handleGoToFormulation}
                disabled={authLoading}
                className={`inline-block font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                  ${authLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                aria-label="Go to formulation platform"
              >
                {authLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Go to Formulation</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="beta-form" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="max-w-xl mx-auto">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: cardVisible ? 1 : 0, y: cardVisible ? 0 : 40 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-8 md:p-10"
          >
            <div className="flex flex-col items-center mb-2">
              {/* Animated Magic Wand Icon */}
              <motion.span
                className="inline-block mb-2"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="url(#grad)" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#f472b6"/>
                    </linearGradient>
                  </defs>
                  <path d="M7 17l10-10M8 8l-1-3m9 9l3 1m-7-2V4m0 16v-4m-7-2h4m8 0h4" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Join the Beta
              </h2>
            </div>
            <p className="text-center text-gray-600 mb-8">
              Be among the first to experience the future of formulation.
            </p>
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center py-12"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  <Lottie
                    animationData={confettiAnimation}
                    loop={false}
                    style={{ width: 200, height: 200, pointerEvents: 'none' }}
                  />
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                    className="inline-block mb-4"
                  >
                    <svg className="text-green-500" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" fill="#d1fae5"/>
                      <path d="M7 13l3 3 7-7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.span>
                  <div className="text-3xl mb-2 text-green-600 font-bold">Thank you!</div>
                  <div className="text-gray-700 mb-2">We've received your request. Stay tuned for updates!</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!showConfirmation && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    aria-label="First Name"
                    aria-required="true"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:shadow-lg hover:shadow-md"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    aria-label="Last Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:shadow-lg hover:shadow-md"
                    placeholder="Enter your last name (optional)"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-label="Email Address"
                  aria-required="true"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:shadow-lg hover:shadow-md"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  aria-label="Company"
                  aria-required="true"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:shadow-lg hover:shadow-md"
                  placeholder="Enter your company name"
                />
              </div>
              <div className="relative">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Who are you? <span className="text-red-500 ml-1">*</span>
                  <span className="ml-2 group relative" tabIndex={0} aria-label="More info" aria-describedby="role-tooltip">
                    <svg className="w-4 h-4 text-blue-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M12 16v-1m0-4V8m0 4h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span id="role-tooltip" role="tooltip" className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white text-xs text-gray-700 rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-10 transition-opacity duration-200">
                      We ask this to personalize your experience and prioritize features for your segment.
                    </span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={handleRoleChange}
                    required
                    aria-label="Who are you?"
                    aria-required="true"
                    className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:shadow-lg hover:shadow-md pr-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    {ROLE_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <motion.button
                type="submit"
                disabled={loading || !isFormValid}
                whileHover={{ scale: loading || !isFormValid ? 1 : 1.03, boxShadow: loading || !isFormValid ? undefined : '0 8px 32px rgba(168,139,250,0.15)' }}
                whileTap={{ scale: loading || !isFormValid ? 1 : 0.97 }}
                className={`w-full py-3 rounded-lg font-semibold text-white text-lg transition-all duration-200 transform
                  ${loading || !isFormValid
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Request My Spot'
                )}
              </motion.button>
            </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
} 