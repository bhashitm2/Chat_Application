# MERN Stack Real Time Chat Application

![Demo App](https://i.ibb.co/fXmZdnz/Screenshot-10.png)

A full-stack real-time chat application built with the MERN stack.

## Features

- 🌟 Tech stack: MERN + Socket.io + TailwindCSS + Daisy UI
- 🎃 Authentication && Authorization with JWT
- 👾 Real-time messaging with Socket.io
- 🚀 Online user status (Socket.io and React Context)
- 👌 Global state management with Zustand
- 🐞 Error handling both on the server and on the client
- ⭐ Deployment ready
- ⏳ And much more!

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Chat_Application
```

### 2. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Setup .env file

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4. Start the application

#### Development Mode

```bash
# Start backend server (from root directory)
npm run server

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

#### Production Mode

```bash
# Build the app
npm run build

# Start the app
npm start
```

## Project Structure

```
Chat_Application/
├── backend/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── zustand/
│   └── public/
└── package.json
```

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, DaisyUI
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: Zustand
- **Styling**: TailwindCSS with DaisyUI components

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
