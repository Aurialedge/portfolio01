// GitHub linguist colors for the languages that appear in the repos.
const COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#663399',
  Solidity: '#AA6746',
  Shell: '#89e051',
};

export const languageColor = (name) => COLORS[name] || '#8b8b9a';
