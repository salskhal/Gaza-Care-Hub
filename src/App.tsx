import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Navigation, OfflineStatusIndicator } from "./components";
import {
  DashboardPage,
  AddPatientPage,
  ExportPage,
  HandoverPage,
} from "./pages";
import { useToast } from "./components/Toast";
import { branding } from "./config";

/**
 * Enhanced App Component with Visual Polish
 *
 * Main application component with improved animations, toast notifications,
 * and consistent Gaza Care Hub branding throughout the interface.
 */
function App() {
  const { ToastContainer, success } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Simulate app initialization with loading state
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);

      // Trigger app ready animation
      setTimeout(() => {
        setAppReady(true);

        // Welcome toast notification
        success(
          `Welcome to ${branding.name}`,
          "Emergency medical triage system ready",
          { duration: 4000 }
        );
      }, 300);
    };

    initializeApp();
  }, []);

  // Loading screen with Gaza Care Hub branding
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 flex items-center justify-center gaza-particles">
        <div className="text-center max-w-md mx-auto p-8 gaza-smooth-entrance">
          {/* Enhanced loading animation */}
          <div className="relative mb-8 gaza-gentle-bounce">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 border-4 border-teal-200 rounded-full gaza-spin"></div>
              <div className="absolute inset-2 border-4 border-teal-400 rounded-full gaza-spin-slow"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg gaza-subtle-glow">
                <svg
                  className="w-8 h-8 text-white gaza-heartbeat-strong"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div
            className="gaza-elegant-slide"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2 gaza-text-gradient gaza-text-shadow">
              {branding.name}
            </h1>
            <p className="text-lg text-teal-600 font-medium mb-4 gaza-text-shadow">
              {branding.tagline}
            </p>
            <p className="text-gray-600 mb-6">{branding.mission}</p>
          </div>

          {/* Loading progress */}
          <div
            className="gaza-smooth-entrance"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="gaza-progress-bar h-2 mb-4">
              <div
                className="gaza-progress-fill"
                style={{ width: "100%", animationDuration: "1s" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 gaza-pulse">
              Initializing medical protocols...
            </p>
          </div>

          {/* Enhanced loading dots */}
          <div
            className="gaza-loading-dots mt-6"
            style={{ animationDelay: "0.6s" }}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50 transition-all duration-1000 ${
          appReady ? "gaza-smooth-entrance" : "opacity-0"
        }`}
      >
        {/* Enhanced Fixed Header with Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 gaza-slide-in-top">
          <Navigation />
          <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm gaza-subtle-glow">
            <OfflineStatusIndicator />
          </div>
        </header>

        {/* Main content with enhanced spacing and background */}
        <main
          className="pt-24 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 gaza-elegant-slide"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/add-patient" element={<AddPatientPage />} />
              <Route path="/handover" element={<HandoverPage />} />
              <Route path="/export" element={<ExportPage />} />
            </Routes>
          </div>
        </main>

        {/* Enhanced background decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Subtle animated background elements */}
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-100/20 rounded-full blur-3xl gaza-float-gentle gaza-breathe"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl gaza-float-gentle gaza-liquid-move"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl gaza-float-gentle gaza-breathe"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Toast notifications */}
        <ToastContainer />

        {/* Accessibility announcements */}
        <div
          id="announcements"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        ></div>
      </div>
    </Router>
  );
}

export default App;
