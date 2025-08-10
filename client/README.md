# E-Commerce Frontend

A modern React TypeScript frontend application for the E-Commerce platform.

## Features

- 🛍️ **Product Catalog** - Browse and search products with filtering and pagination
- 🛒 **Shopping Cart** - Add, remove, and manage cart items
- 👤 **User Authentication** - Login, register, and profile management
- ❤️ **Wishlist** - Save products for later
- 📦 **Order Management** - View order history and status
- 🎨 **Modern UI** - Built with Material-UI for a beautiful, responsive design
- 🔒 **Secure** - JWT authentication and protected routes
- 📱 **Responsive** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Beautiful UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see Server README)

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
client/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable components
│   │   └── layout/         # Layout components (Navbar, etc.)
│   ├── contexts/           # React contexts (Auth, Cart)
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   └── index.tsx           # Entry point
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## API Integration

The frontend communicates with the backend API through the `apiService` module. All API calls are centralized and include:

- Authentication (login, register, logout)
- Product management (list, details, search)
- Cart operations (add, remove, update)
- Order management (create, view, track)
- User profile management
- Wishlist operations

## Key Components

### Authentication
- **AuthContext** - Manages user authentication state
- **Login/Register** - User authentication forms
- **Protected Routes** - Routes that require authentication

### Shopping
- **Product Catalog** - Browse and search products
- **Product Details** - View product information and reviews
- **Shopping Cart** - Manage cart items and quantities
- **Wishlist** - Save products for later

### User Management
- **Profile** - View and edit user information
- **Orders** - View order history and status
- **Navigation** - User-friendly navigation with cart count

## Styling

The application uses Material-UI (MUI) for consistent, modern styling:

- **Theme** - Custom theme with primary and secondary colors
- **Components** - Pre-built MUI components for consistency
- **Responsive** - Mobile-first responsive design
- **Accessibility** - WCAG compliant components

## State Management

The application uses React Context API for state management:

- **AuthContext** - User authentication and profile data
- **CartContext** - Shopping cart state and operations

## Error Handling

- **API Errors** - Centralized error handling for API calls
- **User Feedback** - Toast notifications and error messages
- **Loading States** - Loading indicators for better UX

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

### Best Practices
- Component composition
- Custom hooks for reusable logic
- Proper error boundaries
- Accessibility considerations

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
- `REACT_APP_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
