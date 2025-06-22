# Bibim Frontend

A sophisticated, AI-powered crypto trading platform with a beautiful Korean restaurant-inspired interface.

## 🌟 Features

- 🎨 Beautiful, responsive UI with a warm, inviting Korean restaurant aesthetic
- 🤖 AI-powered strategy building and optimization through LLM integration
- 📊 Real-time backtesting and performance visualization
- 📈 Advanced market data analysis and visualization
- 🧠 Sentiment analysis integration for market insights
- 🔄 Seamless integration with the Bibim Rust backend
- 📱 Mobile-friendly design with smooth animations
- 🌙 Dark/Light theme support
- 🔐 Secure authentication and authorization

## 🏗️ Architecture

```
src/
  ├── components/     # Reusable UI components
  │   ├── common/    # Shared components
  │   ├── charts/    # Data visualization components
  │   ├── forms/     # Form components
  │   └── layout/    # Layout components
  ├── pages/         # Page components
  ├── services/      # API and external service integrations
  ├── styles/        # Theme and global styles
  ├── types/         # TypeScript interfaces and types
  ├── utils/         # Helper functions and utilities
  ├── hooks/         # Custom React hooks
  ├── context/       # React context providers
  ├── assets/        # Images and other static assets
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Rust backend running locally (see main README)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🔌 Backend Integration

The frontend integrates with the Rust backend through RESTful APIs and WebSocket connections:

- **REST API**: Used for CRUD operations, authentication, and data fetching
- **WebSocket**: Used for real-time updates (market data, strategy performance)
- **GraphQL** (Planned): For more efficient data fetching and real-time subscriptions

### API Services

- `strategyApi`: Strategy management and backtesting
- `marketDataApi`: Real-time market data and analysis
- `sentimentApi`: Market sentiment analysis
- `llmApi`: LLM-powered strategy generation and optimization
- `userApi`: User management and authentication

## 🎨 Design System

The frontend uses a custom Material-UI theme with:

- Korean-inspired color palette
- Custom typography with Noto Sans KR
- Consistent spacing and elevation
- Smooth animations and transitions
- Responsive design patterns

## 🔒 Security

- JWT-based authentication
- Secure HTTP-only cookies
- CSRF protection
- Rate limiting
- Input validation
- XSS prevention

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interactions
- Optimized performance
- PWA support (planned)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

## 📦 Deployment

The frontend can be deployed to various platforms:

- Vercel
- Netlify
- AWS Amplify
- Docker container

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 