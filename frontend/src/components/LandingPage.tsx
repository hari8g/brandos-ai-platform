import React, { useState, useEffect } from 'react';
import { useTypewriter } from 'react-simple-typewriter';
import { Link as ScrollLink } from 'react-scroll';
import apiClient from '../services/apiClient';
import { AuthCheckRequest, AuthCheckResponse } from '../types/auth';

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

  // Typewriter effect for headline
  const [text] = useTypewriter({
    words: ['Shape the Future of Formulation—Before Anyone Else'],
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<SubscribeResponse>('/mailchimp/subscribe', formData);
      
      if (response.data.success) {
        // Store email in localStorage for future use
        localStorage.setItem('subscriberEmail', formData.email.toLowerCase());
        setSuccess(true);
        // Wait a moment to show success message, then proceed
        setTimeout(() => {
          onComplete();
        }, 2000);
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

  const isFormValid = formData.email && formData.first_name && formData.company;
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
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-purple-700 to-pink-500 flex items-center justify-center px-4">
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
            Join our closed beta and unlock AI-driven recipe generation tailored to your product vision.
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
      <section id="beta-form" className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join the Beta
            </h2>
            <p className="text-lg text-gray-600">
              Be among the first to experience the future of formulation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div className="md:col-span-1">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your first name"
                  aria-describedby="first_name-error"
                />
                {error && formData.first_name === '' && (
                  <p id="first_name-error" className="mt-1 text-sm text-red-600">
                    First name is required
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="md:col-span-1">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your last name (optional)"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your email address"
                aria-describedby="email-error"
              />
              {error && formData.email === '' && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  Valid email address is required
                </p>
              )}
            </div>

            {/* Company */}
            <div className="mb-8">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Enter your company name"
                aria-describedby="company-error"
              />
              {error && formData.company === '' && (
                <p id="company-error" className="mt-1 text-sm text-red-600">
                  Company name is required
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform
                         ${loading || !isFormValid
                           ? 'bg-gray-300 cursor-not-allowed'
                           : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                         }`}
              aria-describedby="submit-status"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Subscribing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Submit & Join Beta</span>
                </div>
              )}
            </button>
            <div id="submit-status" className="sr-only">
              {loading ? 'Submitting form...' : isFormValid ? 'Form is ready to submit' : 'Please fill in all required fields'}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
} 