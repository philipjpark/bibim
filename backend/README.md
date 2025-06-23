# BIBIM Rust Backend

A high-performance Rust backend for the BIBIM platform, providing blockchain integration, AI-powered trading strategies, and robust data management.

## Features

- **Blockchain Integration**: Direct interaction with BNB Chain for PYUSD and tBNB operations
- **AI Strategy Engine**: Advanced trading strategy creation and signal generation
- **Database Management**: PostgreSQL-based data persistence with SQLx
- **REST API**: Comprehensive API endpoints for frontend integration
- **High Performance**: Rust's memory safety and concurrency features
- **Production Ready**: Configurable for development and production environments

## Prerequisites

- Rust 1.70+ (install via [rustup](https://rustup.rs/))
- PostgreSQL 12+
- Node.js 18+ (for frontend integration)

## Quick Start

### 1. Clone and Setup

```bash
cd backend
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your configuration:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost/bibim

# Blockchain(more to be added as more chains are incorporated)
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
PYUSD_CONTRACT_ADDRESS=your_pyusd_contract_address
TBNB_CONTRACT_ADDRESS=your_tbnb_contract_address

# AI (optional)
AI_MODEL_ENDPOINT=http://localhost:8000/predict
AI_API_KEY=your_api_key
```

### 3. Setup Database

```bash
# Create database
createdb bibim

# Run migrations
cargo install sqlx-cli
sqlx migrate run
```

### 4. Build and Run

```bash
# Development
cargo run

# Production
cargo build --release
./target/release/bibim-backend
```

The server will start on `http://127.0.0.1:3001`

## API Endpoints

### Health Check
```
GET /health
```

### Blockchain Operations
```
GET /api/balances/{wallet_address}
POST /api/swap
```

### Trading Operations
```
GET /api/positions/{wallet_address}
GET /api/history/{wallet_address}
POST /api/strategies
```

### AI Operations
```
GET /api/signals
POST /api/strategies/ai
GET /api/backtest/{strategy_id}
```

## Architecture

### Core Modules

- **`main.rs`**: Application entry point and HTTP server setup
- **`blockchain.rs`**: BNB Chain integration and smart contract operations
- **`trading.rs`**: Trading logic and position management
- **`ai_strategies.rs`**: AI-powered strategy generation and analysis
- **`database.rs`**: Database operations and data persistence
- **`config.rs`**: Environment configuration and validation

### Key Features

#### Blockchain Service
- Real-time balance fetching for PYUSD and tBNB
- Smart contract interaction for token swaps
- Transaction simulation and execution
- Price data retrieval

#### Trading Service
- Swap validation and execution
- Position tracking and management
- Portfolio value calculation
- Trading history management

#### AI Strategy Service
- Strategy creation and management
- Trading signal generation
- Market sentiment analysis
- Strategy backtesting and optimization

#### Database Service
- User management and authentication
- Transaction history storage
- Strategy persistence and performance tracking
- Portfolio snapshot management

## Development

### Running Tests

```bash
# Unit tests
cargo test

# Integration tests
cargo test --test integration_tests

# With coverage
cargo tarpaulin
```

### Code Quality

```bash
# Format code
cargo fmt

# Lint code
cargo clippy

# Check for security issues
cargo audit
```

### Database Migrations

```bash
# Create new migration
sqlx migrate add migration_name

# Run migrations
sqlx migrate run

# Revert migration
sqlx migrate revert
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/bibim-backend /usr/local/bin/
EXPOSE 3001
CMD ["bibim-backend"]
```

### Environment Variables

For production, ensure these environment variables are set:

```bash
RUST_ENV=production
RUST_LOG=warn
DATABASE_URL=postgresql://user:pass@host/db
BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

## Performance

The Rust backend provides significant performance improvements:

- **Memory Safety**: Zero-cost abstractions with compile-time guarantees
- **Concurrency**: Async/await for efficient I/O operations
- **Database**: Connection pooling and prepared statements
- **Blockchain**: Optimized smart contract interactions

## Security

- Input validation and sanitization
- SQL injection prevention via SQLx
- Environment-based configuration
- Secure private key management
- Rate limiting and request validation

## Monitoring

The application includes comprehensive logging and monitoring:

```bash
# View logs
RUST_LOG=debug cargo run

# Monitor performance
cargo install flamegraph
cargo flamegraph
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 