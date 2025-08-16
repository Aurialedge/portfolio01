import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

// Import project images
import cookiepediaImg from '../image/Cookiepedia.jpg';
import stockieImg from '../image/Stock.jpg';
import wardrobeaiImg from '../image/Wardrobe.jpg';
import carpriceImg from '../image/Garage.jpg';

import walkitalkiImg from '../image/WalkiTalki.png';
import adventuriaImg from '../image/Adventuria.jpeg';
import snakeladderImg from '../image/Snake.png';

const projects = [
  // Web Projects
  {
    id: 1,
    title: 'Cookiepedia – AI-Based Cooking Platform',
    description: 'AI-personalized recipe-sharing app with meal suggestion chatbot, social features (follow/save), and search by ingredients.',
    tags: ['ReactJS', 'Node.js', 'Express.js', 'MongoDB', 'OpenAI API', 'JWT', 'Web'],
    image: cookiepediaImg,
    github: 'https://github.com/Aurialedge/cookiepedia-vite.git',
    demo: '#',
    featured: true,
    category: 'Web'
  },
  {
    id: 2,
    title: 'Adventuria Travels',
    description: 'A travel booking platform with user authentication, hotel booking, and destination exploration features.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'REST API', 'Web'],
    image: adventuriaImg,
    github: 'https://github.com/Aurialedge/Adventuria.git',
    demo: '#',
    featured: true,
    category: 'Web'
  },
  // Mobile Projects
  {
    id: 3,
    title: 'WalkiTalki – Real-time Chat Application',
    description: 'A real-time chat application with user authentication, private messaging, and group chats built with modern web technologies.',
    tags: ['React Native', 'Node.js', 'Socket.io', 'MongoDB', 'JWT', 'Redux', 'Mobile'],
    image: walkitalkiImg,
    github: 'https://github.com/Aurialedge/WalkiTalki.git',
    demo: '#',
    featured: true,
    category: 'Mobile'
  },
  // AI/ML Projects
  {
    id: 4,
    title: 'Stock Web – AI-Powered Stock Prediction',
    description: 'Integrated ML models (LSTM, ARIMA) with a React dashboard to visualise and predict stock trends.',
    tags: ['Python', 'LSTM', 'ARIMA', 'Machine Learning', 'Data Analysis', 'AI/ML'],
    image: stockieImg,
    github: 'https://github.com/Aurialedge/Stockie.git',
    demo: '#',
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 5,
    title: 'Car Price Predictor',
    description: 'Used car price estimation with a Linear Regression model (R² = 0.92), deployed on Heroku.',
    tags: ['Python', 'Machine Learning', 'scikit-learn', 'Flask', 'AI/ML'],
    image: carpriceImg,
    github: 'https://github.com/Aurialedge/Car_price_predictor',
    demo: 'https://car-price-predictor-ai.herokuapp.com/',
    featured: true,
    category: 'AI/ML'
  },
  // Other Projects
  {
    id: 6,
    title: 'Wardrobe AI – Smart Dressing Room',
    description: 'Virtual fitting and outfit recommendation engine using computer vision and size-fit intelligence.',
    tags: ['Flutter/React', 'Computer Vision', 'AI/ML', 'Mobile'],
    image: wardrobeaiImg,
    github: 'https://github.com/Aurialedge/WardrobeAI.git',
    demo: '#',
    featured: false,
    category: 'Mobile'
  },
  {
    id: 7,
    title: 'Snake and Ladder Game',
    description: 'Classic Snake and Ladder game built with JavaScript, featuring multiplayer support and animated gameplay.',
    tags: ['JavaScript', 'HTML5', 'CSS3', 'Game Development', 'Web'],
    image: snakeladderImg,
    github: 'https://github.com/Aurialedge/SnakeAndLadder',
    demo: '#',
    featured: false,
    category: 'Web'
  }
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  const filters = ['All', 'Featured', 'Web', 'Mobile', 'AI/ML'];

  const filterProjects = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredProjects(projects);
    } else if (filter === 'Featured') {
      setFilteredProjects(projects.filter(project => project.featured));
    } else {
      setFilteredProjects(
        projects.filter(project => 
          project.category === filter || 
          project.tags.some(tag => 
            tag.toLowerCase() === filter.toLowerCase()
          )
        )
      );
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="py-12">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A collection of my recent work and projects. Each project comes with a brief description and the technologies used.
        </p>
      </motion.div>

      <motion.div 
        className="flex flex-wrap justify-center gap-3 mb-12 px-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filters.map((filter) => (
          <motion.button
            key={filter}
            onClick={() => filterProjects(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter}
          </motion.button>
        ))}
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              variants={item}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                {project.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                  >
                    <CodeBracketIcon className="h-4 w-4 mr-1" />
                    Code
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-500 dark:text-gray-400">No projects found matching the selected filter.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;
