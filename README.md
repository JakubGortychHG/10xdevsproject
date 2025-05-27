# 10xCards

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22.14.0-green.svg)](https://nodejs.org/)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10xCards is a web application that enables automatic generation of educational flashcards using artificial intelligence. The application solves the problem of time-consuming creation of high-quality flashcards, which discourages the use of an effective learning method known as spaced repetition (repeating at intervals).

The main features of the product:
- AI-generated flashcards based on inputted text
- Manual creation of flashcards
- Viewing, editing, and deleting flashcards
- User account system
- Integration with a spaced repetition algorithm

The MVP focuses on basic functionality, offering a minimalist interface and satisfying the main user needs: quickly creating high-quality flashcards and learning effectively with them.

## Tech Stack

### Frontend
- **Astro 5** - Creates fast, efficient pages and applications with minimal JavaScript
- **React 19** - Provides interactivity where needed
- **TypeScript 5** - Offers static typing for better code quality and IDE support
- **Tailwind 4** - Enables convenient application styling
- **Shadcn/ui** - Provides a library of accessible React components for UI

### Backend
- **Supabase** - Comprehensive backend solution:
  - PostgreSQL database
  - SDK in multiple languages (Backend-as-a-Service)
  - Built-in user authentication
  - Open-source solution that can be hosted locally or on your own server

### AI Integration
- **OpenRouter.ai** - Communication with AI models:
  - Access to a wide range of models (OpenAI, Anthropic, Google, and many others)
  - Financial limits can be set on API keys

### Testing
- **Unit Testing:**
  - **Vitest** - Fast testing framework with native Vite/Astro compatibility
  - **React Testing Library** - Component testing for React UI elements
  - **Supertest** - HTTP assertions for testing API endpoints
  - **MSW (Mock Service Worker)** - API mocking for isolated testing

- **End-to-End (E2E) Testing:**
  - **Playwright** - Modern browser automation framework
  - **Headless Browsers** - Chrome/Firefox for CI/CD test environments

### CI/CD and Hosting
- **GitHub Actions** - For creating CI/CD pipelines
- **Cloudflare Pages** - For hosting the application (SSG and SSR with Cloudflare Workers)

## Getting Started Locally

### Prerequisites
- Node.js v22.14.0 (as specified in .nvmrc)
- npm (comes with Node.js)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/JakubGortychHG/10xdevsproject
   cd 10xCards
   ```

2. Install the correct Node.js version using nvm (Node Version Manager)
   ```sh
   nvm use
   ```

3. Install dependencies
   ```sh
   npm install
   ```

4. Start the development server
   ```sh
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

The following scripts are available in the project:

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the built application
- `npm run astro` - Runs Astro CLI commands
- `npm run lint` - Lints the codebase
- `npm run lint:fix` - Lints and fixes issues in the codebase
- `npm run format` - Formats the codebase using Prettier

## Project Scope

### MVP Includes
- AI flashcard generation from text (1,000-10,000 characters)
- Manual flashcard creation
- Flashcard management (view, edit, delete)
- User account system (registration, login)
- Learning system with existing spaced repetition algorithm

### Not Included in MVP
- Advanced custom spaced repetition algorithm
- Import of various formats (PDF, DOCX, etc.)
- Flashcard sharing between users
- Integrations with other educational platforms
- Mobile applications (web-only for now)
- Categorization/tagging of flashcards
- Grouping flashcards into sets/collections
- Flashcard export functions
- User preferences for types of generated flashcards

## Project Status

This project is currently in the early development phase. MVP features are being implemented.

## License

This project is licensed under the MIT License.
