import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, FileDown, Plus, Menu, X, Heart, Clock } from 'lucide-react';
import { branding } from '../config';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

/**
 * Enhanced Navigation Component
 * 
 * Main navigation bar with Gaza Care Hub branding, improved mobile responsiveness,
 * and enhanced active states and hover effects for navigation items.
 */
export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      path: '/', 
      icon: Users, 
      label: 'Dashboard',
      description: 'Patient queue overview'
    },
    { 
      path: '/add-patient', 
      icon: Plus, 
      label: 'Add Patient',
      description: 'Register new patient'
    },
    { 
      path: '/handover', 
      icon: Clock, 
      label: 'Handover',
      description: 'Shift change management'
    },
    { 
      path: '/export', 
      icon: FileDown, 
      label: 'Export Data',
      description: 'Download patient data'
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="bg-white shadow-lg border-b-2 border-teal-100 relative z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
            {/* Enhanced Logo and Branding */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg sm:rounded-xl p-1.5 sm:p-2 lg:p-2.5 shadow-lg gaza-float">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white gaza-heartbeat" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight animate-fade-in">
                  {branding.name}
                </h1>
                <p className="text-xs lg:text-sm text-teal-600 font-medium -mt-1 animate-slide-in-left">
                  {branding.tagline}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold text-gray-900 animate-fade-in">
                  Gaza Care
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map(({ path, icon: Icon, label, description }, index) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group relative inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 animate-fade-in ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 gaza-glow'
                        : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50 hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`h-5 w-5 mr-2.5 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-teal-600'
                    }`} />
                    <span className="relative">
                      {label}
                      {isActive && (
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full animate-scale-in"></div>
                      )}
                    </span>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 animate-fade-in">
                      {description}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </Link>
                );
              })}
              
              {/* Status Indicator */}
              <div className="ml-4 pl-4 border-l border-gray-200">
                <OfflineStatusIndicator variant="badge" className="animate-fade-in" />
              </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-gray-600 hover:text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 min-h-[44px] min-w-[44px]"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-40 animate-fade-in">
            <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
              {navItems.map(({ path, icon: Icon, label, description }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobileMenu}
                    className={`group flex items-center px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 min-h-[48px] ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-teal-700 hover:bg-teal-50 active:bg-teal-100'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 transition-colors duration-200 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-teal-100'
                    }`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-teal-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{label}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm mt-0.5 transition-colors duration-200 ${
                        isActive ? 'text-teal-100' : 'text-gray-500 group-hover:text-teal-600'
                      }`}>
                        {description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Menu Footer */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-teal-50 to-blue-50 border-t border-teal-100">
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <OfflineStatusIndicator variant="detailed" className="animate-fade-in" />
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-teal-700">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 animate-pulse flex-shrink-0" />
                  <span className="font-medium text-center">{branding.mission}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navigation;