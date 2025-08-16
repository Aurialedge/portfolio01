import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeContext } from '../App';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const Layout = ({ children }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div 
      className={`min-h-screen flex flex-col ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={window.location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-7xl"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Layout;
