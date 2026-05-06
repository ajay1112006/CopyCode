# CopyCode

CopyCode is a production-ready Next.js application that allows users to create password-protected rooms for storing and sharing text data across devices securely.

## Features

- **Room Management**: Create custom rooms with unique names.
- **Secure Access**: Password-protected room entry with bcrypt hashing.
- **Session Security**: JWT-based authentication using HTTP-only cookies.
- **Auto-Sync**: Content saves automatically as you type.
- **Modern UI**: Sleek dark-mode interface with glassmorphism and smooth animations.
- **Cross-Device**: Works seamlessly on mobile and desktop.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Security**: `bcryptjs`, `jsonwebtoken`
- **Styling**: Vanilla CSS Modules
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Architecture

- **Password Protection**: Room passwords are hashed using `bcrypt` before storage.
- **Protected Routes**: API routes for fetching and updating room data verify the JWT session cookie.
- **HTTP-only Cookies**: Authentication tokens are stored in HTTP-only, secure cookies to prevent XSS-based token theft.
- **Input Validation**: Sanitized room names and content handling.

## Deployment

This app is ready for deployment on [Vercel](https://vercel.com/).
Don't forget to set the environment variables in your Vercel project settings.

## License

MIT
