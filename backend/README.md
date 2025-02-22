# Price Pilot Backend

The backend service for Price Pilot, handling web scraping and API functionality for cab price comparison.

## 🏗 Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── prices.py
│   │   │   │   └── history.py
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── __init__.py
│   ├── db/
│   │   ├── session.py
│   │   └── models.py
│   ├── scrapers/
│   │   ├── uber.py
│   │   ├── ola.py
│   │   └── base.py
│   └── __init__.py
├── tests/
│   ├── api/
│   ├── scrapers/
│   └── conftest.py
├── alembic/
│   └── versions/
├── alembic.ini
├── main.py
└── requirements.txt
```

## 🚀 Quick Start

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
alembic upgrade head
```

5. Run development server:
```bash
uvicorn main:app --reload
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/price_pilot

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Scraping
CAPTCHA_API_KEY=your-2captcha-api-key
PROXY_URL=your-proxy-url
```

## 📡 API Endpoints

### Price Comparison

```http
GET /api/v1/compare-prices
```

Query Parameters:
- `pickup_location`: string (required)
- `dropoff_location`: string (required)
- `timestamp`: ISO datetime (optional)

Response:
```json
{
  "uber": {
    "price": 250.00,
    "currency": "INR",
    "surge_multiplier": 1.0,
    "estimate_minutes": 5
  },
  "ola": {
    "price": 245.00,
    "currency": "INR",
    "surge_multiplier": 1.0,
    "estimate_minutes": 6
  }
}
```

### Price History

```http
GET /api/v1/price-history
```

Query Parameters:
- `route_id`: string (required)
- `start_date`: ISO date (required)
- `end_date`: ISO date (required)

## 🧪 Testing

Run tests with pytest:
```bash
pytest
```

With coverage:
```bash
pytest --cov=app tests/
```

## 🔒 Security

- Rate limiting per IP
- JWT authentication
- Input validation
- SQL injection protection
- XSS protection
- CORS configuration

## 🔍 Monitoring

Metrics available at `/metrics`:
- Request latency
- Error rates
- Scraping success rates
- Cache hit rates

## 🐳 Docker

Build image:
```bash
docker build -t price-pilot-backend .
```

Run container:
```bash
docker run -p 8000:8000 price-pilot-backend
```

## 📝 Logging

Logs are written to `logs/app.log` with rotation:
- ERROR: Critical issues
- WARNING: Important events
- INFO: General information
- DEBUG: Detailed debugging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📚 Documentation

Full API documentation available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc` 