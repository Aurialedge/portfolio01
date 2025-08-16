import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, MapPinIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const skills = [
  { name: 'Frontend', items: ['React.js', 'Next.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS'] },
  { name: 'Backend', items: ['Node.js', 'Express.js', 'Python', 'Django', 'Flask'] },
  { name: 'Database', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase'] },
  { name: 'Mobile', items: ['Flutter', 'React Native'] },
  { name: 'AI/ML', items: ['TensorFlow', 'PyTorch', 'OpenCV', 'scikit-learn'] },
  { name: 'Tools', items: ['Git', 'Docker', 'AWS', 'Postman', 'Figma'] },
];

const experiences = [
  {
    role: 'Full Stack Developer',
    company: 'Freelance',
    duration: '2022 - Present',
    description: 'Building responsive web applications and implementing AI/ML solutions for various clients.',
    icon: BriefcaseIcon,
  },
  {
    role: 'Research Intern',
    company: 'IIIT Nagpur',
    duration: '2023 - 2024',
    description: 'Working on cutting-edge research in machine learning and computer vision applications.',
    icon: AcademicCapIcon,
  },
];

const education = [
  {
    degree: 'B.Tech in Computer Science',
    institution: 'Indian Institute of Information Technology, Nagpur',
    duration: '2023 - 2027',
    description: 'CGPA: 8.02/10',
    icon: AcademicCapIcon,
  },
  {
    degree: 'Higher Secondary (12th)',
    institution: 'S.P. College, Pune',
    duration: '2021 - 2023',
    description: 'Percentage: 92.5%',
    icon: AcademicCapIcon,
  },
];

const About = () => {
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
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          About Me
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          I'm a passionate developer with a love for creating beautiful, functional, and user-centered digital experiences.
        </p>
      </motion.div>

      {/* Bio Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div 
          className="lg:col-span-2 space-y-6"
          variants={item}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Who am I?</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Hello! I'm Shivraj Perkar, a Computer Science student at IIIT Nagpur with a passion for full-stack development and artificial intelligence. 
              I love turning complex problems into simple, beautiful, and intuitive solutions.
            </p>
            <p>
              My journey in technology started when I was in school, and since then, I've been fascinated by how technology can be used to solve real-world problems. 
              I'm particularly interested in building applications that leverage AI/ML to create meaningful user experiences.
            </p>
            <p>
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing my knowledge with the developer community.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="mailto:saperkar1862004@gmail.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Contact Me
            </a>
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Download CV
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg h-fit"
          variants={item}
          whileHover={{ y: -5 }}
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 overflow-hidden">
            {/* Replace with your profile image */}
            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">SP</div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Shivraj Perkar</h3>
          <p className="text-purple-600 dark:text-purple-400 text-center mb-4">Full Stack Developer</p>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-purple-500" />
              <span>saperkar1862004@gmail.com</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPinIcon className="h-5 w-5 mr-3 text-purple-500" />
              <span>Nagpur, India</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Experience & Education */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div variants={item}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                  <exp.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exp.role}</h3>
                <div className="text-purple-600 dark:text-purple-400 text-sm mb-1">{exp.company} • {exp.duration}</div>
                <p className="text-gray-600 dark:text-gray-300">{exp.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                  <edu.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                <div className="text-purple-600 dark:text-purple-400 text-sm mb-1">{edu.institution} • {edu.duration}</div>
                <p className="text-gray-600 dark:text-gray-300">{edu.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Skills Section */}
      <motion.div 
        className="mb-20"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div 
          className="text-center mb-12"
          variants={item}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Skills</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Here are the technologies and tools I work with on a regular basis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <motion.div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{skill.name}</h3>
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item, i) => (
                  <span 
                    key={i}
                    className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default About;
