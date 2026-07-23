import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../components/Logo";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Function to get a more reliable Google profile picture URL
  const getOptimizedProfilePicture = (originalUrl) => {
    if (!originalUrl) return null;

    // If it's a Google profile picture, try to use a smaller size to reduce rate limiting
    if (originalUrl.includes("googleusercontent.com")) {
      // Replace s96-c with s64-c for smaller size, which may have better rate limits
      return originalUrl.replace(/s\d+-c/, "s64-c");
    }

    return originalUrl;
  };

  // Reset image error state when user profile picture changes
  useEffect(() => {
    setImageLoadError(false);
    // Debug logging
    console.log("Header - User profile picture URL:", user?.profile_picture);
    console.log(
      "Header - Optimized URL:",
      getOptimizedProfilePicture(user?.profile_picture)
    );
  }, [user?.profile_picture]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="bg-slate-800/30 backdrop-blur-lg sticky top-0 z-50 w-full overflow-x-hidden">
        <nav className="container mx-auto px-4 md:px-6 py-1 md:py-2 flex justify-between items-center max-w-full">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-white focus:outline-none p-1 -ml-1"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="hidden md:block">
                <Logo />
              </div>
              <div className="md:hidden logo-container flex items-center gap-1 md:gap-4">
                <img src="/logo10.png" alt="Certus Diagnostics" className="h-16 w-auto" />
              </div>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/book-a-test"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Book a Test
            </Link>
            <Link
              to="/your-reports"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Your Reports
            </Link>
            <Link
              to="/health-history"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Health History
            </Link>
            <Link
              to="/contact-us"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  {user?.profile_picture && !imageLoadError ? (
                    <img
                      src={getOptimizedProfilePicture(user.profile_picture)}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={() => {
                        console.warn(
                          "Header profile picture failed to load, using fallback"
                        );
                        setImageLoadError(true);
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300 text-sm">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="logo-container flex items-center gap-1 md:gap-4">
            <img src="/logo10.png" alt="Certus Diagnostics" className="h-16 w-auto" />
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
          <Link
            to="/"
            className="block text-lg font-medium text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/book-a-test"
            className="block text-lg font-medium text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Book a Test
          </Link>
          <Link
            to="/your-reports"
            className="block text-lg font-medium text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Your Reports
          </Link>
          <Link
            to="/health-history"
            className="block text-lg font-medium text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Health History
          </Link>
          <Link
            to="/contact-us"
            className="block text-lg font-medium text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
        </div>

        <div className="p-4 border-t border-slate-700/50">
          {isLoggedIn ? (
            <>
              <div className="flex items-center space-x-3 py-3 px-2 rounded-lg bg-slate-800/50 cursor-pointer mb-3" onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }}>
                {user?.profile_picture && !imageLoadError ? (
                  <img
                    src={getOptimizedProfilePicture(user.profile_picture)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    onError={() => {
                      setImageLoadError(true);
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
                <div className="flex flex-col truncate">
                  <span className="text-white font-medium truncate">{user?.name}</span>
                  <span className="text-slate-400 text-xs truncate">{user?.email || "User"}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
