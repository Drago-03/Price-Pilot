# Price-Pilot 🚀

A modern price tracking and monitoring application that helps users track product prices across various e-commerce platforms.

## 🌟 Features

- Real-time price tracking
- Multi-platform support
- Price history visualization
- Automated price alerts
- User-friendly interface

## 🏗️ Project Structure

```
price-pilot/
├── frontend/               # React/Next.js frontend application
│   ├── app/               # Application pages and routes
│   ├── components/        # Reusable UI components
│   ├── services/          # API integration services
│   └── constants/         # Application constants
│
├── backend/               # FastAPI backend application
│   ├── app/              # Application modules
│   ├── alembic/          # Database migrations
│   └── main.py           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Redis

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Backend Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Application secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration time
- `RATE_LIMIT_PER_MINUTE`: API rate limiting configuration

### Frontend Environment Variables

- Configure in `.env` file
- API endpoint configurations
- Feature flags

## 📚 API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Price-Pilot
- Built with FastAPI and Next.js 