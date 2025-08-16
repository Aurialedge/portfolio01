# Backend Email App

This project is a simple backend application that sends an email when a contact form is submitted. It uses Express.js for handling HTTP requests and Nodemailer for sending emails.

## Project Structure

```
backend-email-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers
│   │   └── emailController.ts # Handles email sending logic
│   ├── routes
│   │   └── contactRoutes.ts   # Defines routes for contact form
│   └── types
│       └── index.ts           # Type definitions for request body
├── package.json               # NPM package configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd backend-email-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure email settings:**
   Update the email configuration in `src/controllers/emailController.ts` to include your email service credentials.

4. **Run the application:**
   ```
   npm start
   ```

## Usage

To use the contact form functionality, send a POST request to `/contact` with the following JSON body:

```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "message": "Your message here"
}
```

Upon submission, the application will send an email to the configured recipient with the details provided in the contact form.