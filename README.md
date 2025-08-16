# Modern Portfolio Website

A beautiful, responsive, and modern portfolio website built with React, Tailwind CSS, and Framer Motion. This portfolio showcases your projects, skills, and experience with smooth animations and a clean, professional design.

![Portfolio Preview](https://via.placeholder.com/1200x630/1a202c/ffffff?text=Portfolio+Preview)

## 🚀 Features

- **Multi-page Navigation** - Built with React Router for seamless page transitions
- **Dark/Light Mode** - Toggle between light and dark themes
- **Responsive Design** - Fully responsive layout that works on all devices
- **Smooth Animations** - Powered by Framer Motion for buttery smooth transitions
- **Modern UI/UX** - Clean, professional design with attention to detail
- **Contact Form** - Integrated with EmailJS for easy communication
- **Project Showcase** - Beautiful project cards with filtering capabilities
- **Skills Section** - Visual representation of your skills and expertise

## 🛠️ Technologies Used

- React 18
- React Router v6
- Tailwind CSS
- Framer Motion
- Hero Icons
- EmailJS
- PostCSS
- Autoprefixer

## 📦 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aurialedge/Portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your EmailJS credentials:
   ```
   REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🚀 Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🎨 Customization

### Theme Colors

You can customize the color scheme by editing the `tailwind.config.js` file. The primary and secondary colors are defined in the `theme.extend.colors` section.

### Content

Update the following files to customize the content:

- `src/data/projects.js` - Add/update your projects
- `src/data/skills.js` - Update your skills
- `src/data/experience.js` - Add your work experience
- `src/data/education.js` - Add your education
- `src/components/About/About.js` - Update your bio and about section

### Images

Replace the placeholder images in the `public/images` directory with your own images. Update the image paths in the respective components.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Create React App](https://create-react-app.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Hero Icons](https://heroicons.com/)
- [EmailJS](https://www.emailjs.com/)

## 📬 Contact

For any questions or suggestions, feel free to open an issue or submit a pull request.
