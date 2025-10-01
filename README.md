# DivyaYatri - Temple Guide App

A comprehensive temple guide application built with MERN stack, TypeScript, and shadcn/ui.

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Vite for bundling
- Tailwind CSS
- shadcn/ui components
- React Router
- Axios for API calls

### Backend
- Node.js + Express.js (TypeScript)
- MongoDB with Mongoose
- JWT for authentication

### Additional Services
- Cloudinary for image storage
- Google Maps API
- i18n for multilingual support

## 🎯 Features

- **Authentication**: JWT-based with role-based access (user, admin, temple manager)
- **Temple Management**: Complete CRUD with temple claim workflow
- **Search & Discovery**: Search by location, deity, filters with map view
- **Temple Details**: Comprehensive information with reviews and photos
- **Community**: User reviews and photo contributions
- **Admin Dashboard**: Complete management system

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd DivyaYatri
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables (see .env.example files)

5. Start development servers
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## 📂 Project Structure

```
DivyaYatri/
├── server/          # Express.js backend
│   ├── src/
│   │   ├── models/  # Mongoose schemas
│   │   ├── routes/  # API routes
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   └── server.ts
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── main.tsx
└── README.md
```

## 🔧 Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/divyayatri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📝 License

This project is licensed under the MIT License.