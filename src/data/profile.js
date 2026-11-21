// Everything here comes from the resume (Shivraj_Perkar_Resume.pdf).
// Edit this file to update personal details; projects are synced from GitHub.

export const profile = {
  name: 'Shivraj Perkar',
  initials: 'SP',
  role: 'Software Engineer',
  focus: 'Backend · Distributed Systems · Full-Stack',
  location: 'Nagpur, India',
  summary:
    'Computer Science undergraduate at IIIT Nagpur building scalable backend and full-stack systems. I care about reliability under load: job queues that never double-process, APIs that stay fast at P95, and data paths you can audit.',
  email: 'saperkar1862004@gmail.com',
  phone: '+91 72495 66615',
  resume: '/Shivraj_Perkar_Resume.pdf',
  github: 'https://github.com/Aurialedge',
  githubUser: 'Aurialedge',
  linkedin: 'https://linkedin.com/in/shivraj-perkar-8a15b2252',
  leetcode: 'https://leetcode.com/u/Shivraj18/',
};

export const stats = [
  { value: '220+', label: 'LeetCode problems solved' },
  { value: '7.8', label: 'CGPA at IIIT Nagpur' },
  { value: 'Runner-up', label: 'GPT-3.5 national hackathon' },
];

export const education = {
  school: 'Indian Institute of Information Technology, Nagpur',
  degree: 'B.Tech in Computer Science and Engineering',
  period: 'Aug 2023 – Present',
  grade: 'CGPA 7.8 / 10',
};

export const experience = [
  {
    company: 'Veqiro',
    role: 'SDE Intern',
    period: 'Jun 2026 – Aug 2026',
    points: [
      'Engineered backend systems for a multi-agent AI workforce platform, enabling 6 specialized AI agents to execute business workflows through shared company context, tool integrations, and coordinated task orchestration.',
      'Implemented scalable system components, API integrations, and agent orchestration workflows.',
      'Contributed to software design, debugging, and performance optimization to improve system reliability.',
    ],
    tags: ['Multi-agent systems', 'Backend', 'API integrations', 'Orchestration'],
  },
];

export const skills = [
  { group: 'Languages', items: ['C++', 'Go', 'Python', 'JavaScript', 'Java', 'SQL'] },
  { group: 'Backend', items: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'JWT / RBAC', 'Goroutines & Channels'] },
  { group: 'Frontend', items: ['React.js', 'Next.js', 'Tailwind CSS', 'HTML', 'CSS'] },
  { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Connection pooling (pgxpool)', 'ACID transactions'] },
  { group: 'Tooling', items: ['Git / GitHub', 'Docker', 'Postman', 'CI/CD', 'Prometheus'] },
  { group: 'Core CS', items: ['Data Structures & Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks'] },
];

export const achievements = [
  { title: 'Runner-up, GPT-3.5 Hackathon', detail: 'Competitive national AI/ML hackathon.' },
  { title: 'Semi-finalist, GRAB Hackathon 2025', detail: 'Shortlisted among the top teams nationally.' },
  { title: '220+ LeetCode problems', detail: 'Consistent DSA practice in C++.', href: 'https://leetcode.com/u/Shivraj18/' },
  { title: 'Abacus Nationalist', detail: 'National-level abacus competitor.' },
];

export const certifications = [
  {
    title: 'Google AI Essentials',
    issuer: 'Google',
    date: 'Aug 2024',
    href: 'https://www.coursera.org/account/accomplishments/records/HCJWKBO5BQCO',
  },
  {
    title: 'Career Essentials in Software Development',
    issuer: 'Microsoft & LinkedIn',
    date: 'Jul 2024',
    href: 'https://www.linkedin.com/learning/certificates/89814d2b2cd007b80c7b379f2ef1775ddb341852afd01a58222b197fd3040e8c/',
  },
  {
    title: 'Career Essentials in Generative AI',
    issuer: 'Microsoft & LinkedIn',
    date: 'Jun 2024',
    href: 'https://www.linkedin.com/learning/certificates/9322ce44669008827dcd1f21337897c89deff9edf8addfb9104f021948cd4c49/',
  },
  {
    title: 'Career Essentials in Data Analysis',
    issuer: 'Microsoft & LinkedIn',
    date: 'Jun 2024',
    href: 'https://www.linkedin.com/learning/certificates/99c6323e4bf445537add2703b95bcbc3f999af93e09a30079e445873f1585ec3/',
  },
];
