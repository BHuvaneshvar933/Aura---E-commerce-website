# AURA - Premium Lifestyle E-Commerce

AURA is a fully-featured, production-grade e-commerce platform designed for premium lifestyle brands. It features a bespoke, minimalist frontend and a highly scalable, asynchronous FastAPI backend.

## Architecture

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** FastAPI, Python, SQLAlchemy (Async)
- **Database:** PostgreSQL (with Alembic for migrations)
- **Caching & Tasks:** Redis, Celery
- **Payments:** Razorpay Integration
- **Containerization:** Docker & Docker Compose

## Features

- **Premium UI/UX:** A bespoke soft-minimalist light theme designed for high-end fashion catalogs.
- **Robust Authentication:** JWT-based authentication with role-based access control (Admin vs User).
- **Product & Inventory Management:** Full CRUD operations for products, categories, and real-time inventory tracking.
- **Shopping Cart & Checkout:** Persistent cart, coupon application, and secure payment processing via Razorpay.
- **Order Tracking:** WebSocket-based real-time order status updates.
- **Caching:** Redis-backed caching for high-traffic endpoints like product listings.

## Quick Start (Docker)

The easiest way to run the entire AURA platform locally is using Docker Compose.

### Prerequisites
- Docker & Docker Compose
- Node.js (if you wish to run the frontend independently)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/BHuvaneshvar933/Aura---E-commerce-website.git
   cd Aura---E-commerce-website
   ```

2. **Environment Variables**
   The project includes a `.env.docker` file configured for local development. For production, create a `.env` file based on `production.env.template`.

3. **Start the Infrastructure**
   Build and start the backend, database, and Redis cache:
   ```bash
   docker compose up --build -d
   ```
   The backend API will be available at `http://localhost:8001`.
   API Documentation (Swagger UI) is available at `http://localhost:8001/docs`.

4. **Start the Frontend**
   Navigate to the frontend directory and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

## Database Management

The database is automatically migrated and seeded with initial AURA catalog data when the backend container starts. 

To manually create an admin user or run custom migrations, you can execute commands inside the API container:

```bash
# Create an admin user
docker exec -it ecommerce_api_cont python -m app.scripts.create_admin
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
