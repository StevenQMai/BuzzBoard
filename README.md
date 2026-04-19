# BuzzBoard

## Project Overview
tbd

## Project Structure
The project is organized into two main directories: `client` for the frontend and `server` for the backend.

### Client
- **src/app**: Contains the main layout and pages of the Next.js application.
  - `layout.tsx`: Defines the layout component for the application.
  - `page.tsx`: Serves as the main entry point for the application.
  - `globals.css`: Contains global CSS styles, including TailwindCSS imports.
- **src/components**: Contains reusable components.
  - `index.ts`: Exports various components for modular management.
- **src/lib**: Contains utility functions.
  - `utils.ts`: Utility functions for the application.
- **public**: Directory for static assets such as images and fonts.
- **package.json**: Configuration file for the client-side application.
- **tsconfig.json**: TypeScript configuration file for the client-side application.
- **tailwind.config.js**: Configuration for TailwindCSS.
- **postcss.config.js**: Configuration for PostCSS.
- **next.config.js**: Configuration settings specific to the Next.js application.

### Server
- **src**: Contains the server-side code.
  - `index.ts`: Entry point for the Express server.
  - `routes`: Contains route definitions for the API.
    - `index.ts`: Exports route definitions.
  - `controllers`: Contains controller functions for handling route logic.
    - `index.ts`: Exports controller functions.
  - `models`: Defines data models for MongoDB.
    - `index.ts`: Data models used with MongoDB.
  - `middleware`: Contains middleware functions for the Express application.
    - `index.ts`: Exports middleware functions.
  - `config`: Contains configuration files.
    - `database.ts`: Configuration for connecting to MongoDB.
- **package.json**: Configuration file for the server-side application.
- **tsconfig.json**: TypeScript configuration file for the server-side application.

## Setup Instructions
1. Clone the repository.
2. Navigate to the `client` directory and run `npm install` to install frontend dependencies.
3. Navigate to the `server` directory and run `npm install` to install backend dependencies.
4. Set up your MongoDB database and update the connection settings in `server/src/config/database.ts`.
5. Start the server by running `npm start` in the `server` directory.
6. Start the client by running `npm run dev` in the `client` directory.

## Contributors 
- Steven Mai
- Andrew Liu
- Jack Tran
- Alaa AbuHelwa
- Rohan Konanki
- Abhishek Dharmadhikari
- Ethan Zhang
- Tommy Wu
- Monia Hossain
- Aiden Dowling
