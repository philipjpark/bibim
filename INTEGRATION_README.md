# Congee Platform - Data Integration Guide

## 🚀 New CoinGecko Integration

We've successfully implemented the first critical integration outlined in our comprehensive integration analysis. The CoinGecko API client provides real-time and historical market data for comprehensive backtesting and strategy development.

## 📋 What's New

### ✅ Implemented Features

1. **CoinGecko API Client** (`src/integrations/coingecko.rs`)
   - Historical OHLCV data fetching
   - Current price queries
   - Market overview data
   - Rate limiting and error handling
   - Support for both free and Pro API tiers

2. **Enhanced Data Provider** (`src/data_sources.rs`)
   - Unified interface for multiple data sources
   - Async/await support for better performance
   - Legacy compatibility maintained

3. **Advanced Backtesting Engine** (`src/backtesting.rs`)
   - Real historical data integration
   - Moving average crossover strategy implementation
   - Comprehensive performance metrics
   - Risk-adjusted returns calculation
   - Sharpe ratio, maximum drawdown, profit factor

4. **New API Endpoints**
   - `/api/data/current_price/{symbol}` - Get current price
   - `/api/data/historical/{symbol}/{days}` - Get historical data
   - `/api/data/market_overview` - Get market overview
   - `/api/backtest/{symbol}/{days}` - Run backtest with real data

## 🔧 Usage Examples

### 1. Get Current Bitcoin Price
```bash
curl http://localhost:8080/api/data/current_price/bitcoin
```

**Response:**
```json
{
  "symbol": "bitcoin",
  "price": 43250.67,
  "currency": "USD",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "CoinGecko API"
}
```

### 2. Get Historical Data
```bash
curl http://localhost:8080/api/data/historical/ethereum/30
```

**Response:**
```json
{
  "symbol": "ethereum",
  "days": 30,
  "data_points": 30,
  "historical_data": [...],
  "status": "success",
  "source": "CoinGecko API"
}
```

### 3. Run Backtest
```bash
curl http://localhost:8080/api/backtest/bitcoin/90
```

**Response:**
```json
{
  "backtest_result": {
    "strategy_name": "Moving Average Crossover",
    "symbol": "bitcoin",
    "performance_metrics": {
      "total_return": 0.1523,
      "annualized_return": 0.6192,
      "volatility": 0.3456,
      "sharpe_ratio": 1.79,
      "max_drawdown": 0.0834,
      "win_rate": 0.625,
      "profit_factor": 1.84
    },
    "trade_statistics": {
      "total_trades": 12,
      "winning_trades": 8,
      "losing_trades": 4
    }
  }
}
```

### 4. Market Overview
```bash
curl http://localhost:8080/api/data/market_overview
```

## 🧪 Testing the Integration

We've included a comprehensive test script to verify all functionality:

```bash
# Make the test script executable
chmod +x test_integrations.py

# Run the tests (requires Python 3 and requests library)
python3 test_integrations.py
```

Or install requirements and run:
```bash
pip install requests
python test_integrations.py
```

## ⚙️ Configuration

### CoinGecko API Configuration

The integration supports both free and Pro API tiers:

**Free Tier (Default):**
- 50 calls per minute
- Basic historical data
- No API key required

**Pro Tier (Recommended for Production):**
- Higher rate limits
- More detailed data
- Premium endpoints

To use Pro tier, set your API key as an environment variable:
```bash
export COINGECKO_API_KEY="your_api_key_here"
```

## 🎯 Strategy Implementation

The backtesting engine now includes a sophisticated moving average crossover strategy:

- **Entry Signal:** 10-day MA crosses above 20-day MA
- **Exit Signal:** 10-day MA crosses below 20-day MA OR 5% stop loss
- **Position Sizing:** 95% of available equity
- **Risk Management:** Built-in stop loss and commission calculation

## 📊 Performance Metrics

The enhanced backtesting provides comprehensive metrics:

- **Total Return:** Overall strategy performance
- **Annualized Return:** Yearly equivalent return
- **Volatility:** Risk measurement (annualized)
- **Sharpe Ratio:** Risk-adjusted return metric
- **Maximum Drawdown:** Worst peak-to-trough decline
- **Win Rate:** Percentage of profitable trades
- **Profit Factor:** Ratio of gross profits to gross losses

## 🚦 What's Next

This integration is **Phase 1** of our comprehensive integration plan. Next phases include:

### Phase 2 (Weeks 3-4):
- Binance API integration for high-frequency data
- WebSocket streaming for real-time updates
- News sentiment integration
- Advanced performance analytics

### Phase 3 (Weeks 5-6):
- On-chain data integration (Dune Analytics)
- Social sentiment monitoring
- DeFi protocol tracking

### Phase 4 (Weeks 7-8):
- Machine learning pipeline
- Automated hyperparameter optimization
- Real-time inference system

## 🔍 Troubleshooting

### Common Issues:

1. **Rate Limiting Errors**
   - Solution: Upgrade to CoinGecko Pro or reduce request frequency

2. **Network Timeouts**
   - Solution: Check internet connection and CoinGecko API status

3. **Missing Historical Data**
   - Solution: Verify symbol name (use CoinGecko ID format)

4. **Compilation Errors**
   - Solution: Ensure all dependencies in Cargo.toml are up to date

### Debug Mode:

Run with detailed logging:
```bash
RUST_LOG=debug cargo run
```

## 📝 Development Notes

- All integrations are modular and can be easily extended
- Error handling includes retry logic and graceful degradation
- Performance optimized with async/await throughout
- Comprehensive test coverage for all endpoints
- Documentation generated with `cargo doc`

---

**Happy Trading! 🎯📈**

For questions or issues, please refer to the main project documentation or create an issue in the repository. 