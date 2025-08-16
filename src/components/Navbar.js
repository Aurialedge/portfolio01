import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../App';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const NavIcon = ({ icon, title, isActive, onClick }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const rotateX = useTransform(y, [-50, 50], [10, -10]);
    const rotateY = useTransform(x, [-50, 50], [-10, 10]);
    
    return (
      <motion.div
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        whileHover="hover"
        animate={isActive ? "active" : "inactive"}
        onClick={onClick}
        className="relative"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          variants={{
            hover: { 
              y: -5,
              scale: 1.3,
              transition: { 
                type: 'spring',
                stiffness: 300,
                damping: 15
              } 
            },
            active: { 
              scale: 1.2,
              color: '#8b5cf6',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.7)'
            }
          }}
          onHoverStart={() => {
            document.body.style.cursor = 'pointer';
          }}
          onHoverEnd={() => {
            document.body.style.cursor = 'default';
          }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            x.set(e.clientX - (rect.left + rect.width / 2));
            y.set(e.clientY - (rect.top + rect.height / 2));
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
          className="relative z-10 text-3xl p-2 rounded-full bg-white/5 backdrop-blur-sm"
          title={title}
        >
          {icon}
          {isActive && (
            <motion.span 
              className="absolute -bottom-1 left-1/2 w-1/2 h-1 bg-purple-500 rounded-full"
              initial={{ scaleX: 0, x: '-50%' }}
              animate={{ scaleX: 1 }}
              style={{ originX: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )}
          <motion.span 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0"
            variants={{
              hover: { opacity: 1 },
              active: { opacity: 0.3 }
            }}
          />
        </motion.div>
      </motion.div>
    );
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: '🏠', title: 'Home' },
    { name: 'About', path: '/about', icon: '👤', title: 'About' },
    { name: 'Projects', path: '/projects', icon: '💻', title: 'Projects' },
    { name: 'Contact', path: '/contact', icon: '📧', title: 'Contact' },
  ];

  const handleNavClick = (path) => {
    setIsOpen(false);
    // Smooth scroll to top if already on the same page
    if (location.pathname === path) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 shadow-lg py-0' 
          : 'bg-white/80 dark:bg-gray-900/80 shadow-sm py-2'
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center"
              onClick={() => handleNavClick('/')}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                whileHover={{ scale: 1.05, rotate: [0, 10, -10, 0] }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                SP
              </motion.div>
              <motion.span 
                className="ml-4 text-2xl font-bold hidden sm:block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
              >
                Shivraj Perkar
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <div key={link.path} className="relative">
                <Link
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className="block"
                >
                  <NavIcon
                    icon={link.icon}
                    title={link.title}
                    isActive={location.pathname === link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.path);
                      navigate(link.path);
                    }}
                  />
                </Link>
              </div>
            ))}
            <motion.button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
              whileHover={{ 
                scale: 1.2,
                rotate: 15,
                transition: { type: 'spring', stiffness: 300, damping: 15 }
              }}
              whileTap={{ 
                scale: 0.9,
                rotate: -15,
                transition: { type: 'spring', stiffness: 500, damping: 15 }
              }}
              animate={darkMode ? 'sun' : 'moon'}
              variants={{
                sun: { 
                  rotate: 0,
                  color: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)'
                },
                moon: { 
                  rotate: 0,
                  color: '#4f46e5',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)'
                }
              }}
            >
              {darkMode ? (
                <motion.div
                  animate={{ 
                    rotate: 45,
                    scale: 1.2,
                    filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))'
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <SunIcon className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    rotate: 30,
                    scale: 1.2,
                    filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.7))'
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <MoonIcon className="h-6 w-6" />
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900">
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="border-l-2 border-transparent hover:border-primary-500 pl-2"
                >
                  <Link
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      location.pathname === link.path
                        ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-2xl">{link.icon}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="px-3 py-2">
                <motion.button
                  onClick={toggleDarkMode}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {darkMode ? (
                    <>
                      <SunIcon className="h-5 w-5 mr-2 text-yellow-400" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      Dark Mode
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
