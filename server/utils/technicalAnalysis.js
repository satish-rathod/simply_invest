// Advanced Technical Analysis Utilities
export const calculateTechnicalIndicators = async (historicalData, parameters) => {
  const indicators = {};
  
  // Extract price data
  const prices = historicalData.map(d => d.close);
  const highs = historicalData.map(d => d.high);
  const lows = historicalData.map(d => d.low);
  const volumes = historicalData.map(d => d.volume);
  
  // Simple Moving Average (SMA)
  indicators.shortSMA = calculateSMA(prices, parameters.shortPeriod || 10);
  indicators.longSMA = calculateSMA(prices, parameters.longPeriod || 20);
  
  // Exponential Moving Average (EMA)
  indicators.shortEMA = calculateEMA(prices, parameters.shortPeriod || 10);
  indicators.longEMA = calculateEMA(prices, parameters.longPeriod || 20);
  
  // Relative Strength Index (RSI)
  indicators.rsi = calculateRSI(prices, parameters.rsiPeriod || 14);
  
  // Moving Average Convergence Divergence (MACD)
  indicators.macd = calculateMACD(prices, 12, 26, 9);
  
  // Bollinger Bands
  indicators.bollingerBands = calculateBollingerBands(prices, 20, 2);
  
  // Stochastic Oscillator
  indicators.stochastic = calculateStochastic(highs, lows, prices, 14);
  
  // Average True Range (ATR)
  indicators.atr = calculateATR(highs, lows, prices, 14);
  
  // Williams %R
  indicators.williamsR = calculateWilliamsR(highs, lows, prices, 14);
  
  // Commodity Channel Index (CCI)
  indicators.cci = calculateCCI(highs, lows, prices, 20);
  
  // On-Balance Volume (OBV)
  indicators.obv = calculateOBV(prices, volumes);
  
  // Volume Weighted Average Price (VWAP)
  indicators.vwap = calculateVWAP(highs, lows, prices, volumes);
  
  return indicators;
};

// Simple Moving Average
export const calculateSMA = (prices, period) => {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
};

// Exponential Moving Average
export const calculateEMA = (prices, period) => {
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  ema.push(sum / period);
  
  // Calculate EMA for the rest
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }
  
  return ema;
};

// Relative Strength Index
export const calculateRSI = (prices, period) => {
  const rsi = [];
  const gains = [];
  const losses = [];
  
  // Calculate initial gains and losses
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // Calculate RSI
  for (let i = period - 1; i < gains.length; i++) {
    let avgGain, avgLoss;
    
    if (i === period - 1) {
      // First RSI calculation
      avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      // Subsequent RSI calculations (smoothed)
      const prevAvgGain = rsi[rsi.length - 1].avgGain;
      const prevAvgLoss = rsi[rsi.length - 1].avgLoss;
      
      avgGain = (prevAvgGain * (period - 1) + gains[i]) / period;
      avgLoss = (prevAvgLoss * (period - 1) + losses[i]) / period;
    }
    
    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push(rsiValue);
  }
  
  return rsi;
};

// MACD
export const calculateMACD = (prices, fastPeriod, slowPeriod, signalPeriod) => {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  const macdLine = [];
  const startIndex = slowPeriod - fastPeriod;
  
  for (let i = startIndex; i < fastEMA.length; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i - startIndex]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = [];
  
  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    histogram.push(macdLine[i] - signalLine[i - signalPeriod + 1]);
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
};

// Bollinger Bands
export const calculateBollingerBands = (prices, period, multiplier) => {
  const sma = calculateSMA(prices, period);
  const bands = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    bands.push({
      upper: mean + (multiplier * stdDev),
      middle: mean,
      lower: mean - (multiplier * stdDev)
    });
  }
  
  return bands;
};

// Stochastic Oscillator
export const calculateStochastic = (highs, lows, closes, period) => {
  const stochastic = [];
  
  for (let i = period - 1; i < closes.length; i++) {
    const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
    const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
    
    const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    stochastic.push(k);
  }
  
  return stochastic;
};

// Average True Range
export const calculateATR = (highs, lows, closes, period) => {
  const trueRanges = [];
  
  for (let i = 1; i < highs.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  return calculateSMA(trueRanges, period);
};

// Williams %R
export const calculateWilliamsR = (highs, lows, closes, period) => {
  const williamsR = [];
  
  for (let i = period - 1; i < closes.length; i++) {
    const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
    const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
    
    const wr = ((highestHigh - closes[i]) / (highestHigh - lowestLow)) * -100;
    williamsR.push(wr);
  }
  
  return williamsR;
};

// Commodity Channel Index
export const calculateCCI = (highs, lows, closes, period) => {
  const typicalPrices = [];
  
  for (let i = 0; i < highs.length; i++) {
    typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
  }
  
  const sma = calculateSMA(typicalPrices, period);
  const cci = [];
  
  for (let i = period - 1; i < typicalPrices.length; i++) {
    const slice = typicalPrices.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const meanDeviation = slice.reduce((sum, tp) => sum + Math.abs(tp - mean), 0) / period;
    
    const cciValue = (typicalPrices[i] - mean) / (0.015 * meanDeviation);
    cci.push(cciValue);
  }
  
  return cci;
};

// On-Balance Volume
export const calculateOBV = (prices, volumes) => {
  const obv = [volumes[0]];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      obv.push(obv[i - 1] + volumes[i]);
    } else if (prices[i] < prices[i - 1]) {
      obv.push(obv[i - 1] - volumes[i]);
    } else {
      obv.push(obv[i - 1]);
    }
  }
  
  return obv;
};

// Volume Weighted Average Price
export const calculateVWAP = (highs, lows, closes, volumes) => {
  const vwap = [];
  let cumulativeVolume = 0;
  let cumulativeVolumePrice = 0;
  
  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativeVolumePrice += typicalPrice * volumes[i];
    cumulativeVolume += volumes[i];
    
    vwap.push(cumulativeVolumePrice / cumulativeVolume);
  }
  
  return vwap;
};

// Support and Resistance Levels
export const calculateSupportResistance = (highs, lows, closes, period = 20) => {
  const levels = [];
  
  for (let i = period; i < closes.length - period; i++) {
    const slice = closes.slice(i - period, i + period + 1);
    const current = closes[i];
    
    // Check if current price is a local maximum (resistance)
    if (current === Math.max(...slice)) {
      levels.push({ type: 'resistance', price: current, index: i });
    }
    
    // Check if current price is a local minimum (support)
    if (current === Math.min(...slice)) {
      levels.push({ type: 'support', price: current, index: i });
    }
  }
  
  return levels;
};

// Fibonacci Retracement
export const calculateFibonacciRetracement = (high, low) => {
  const diff = high - low;
  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  
  return levels.map(level => ({
    level,
    price: high - (diff * level)
  }));
};

// Market Strength Indicator
export const calculateMarketStrength = (indicators) => {
  let strength = 0;
  let signals = 0;
  
  // RSI analysis
  if (indicators.rsi && indicators.rsi.length > 0) {
    const currentRSI = indicators.rsi[indicators.rsi.length - 1];
    if (currentRSI < 30) {
      strength += 1; // Oversold, bullish
    } else if (currentRSI > 70) {
      strength -= 1; // Overbought, bearish
    }
    signals++;
  }
  
  // MACD analysis
  if (indicators.macd && indicators.macd.macd.length > 0) {
    const macdData = indicators.macd;
    const currentMACD = macdData.macd[macdData.macd.length - 1];
    const currentSignal = macdData.signal[macdData.signal.length - 1];
    
    if (currentMACD > currentSignal) {
      strength += 1; // Bullish
    } else {
      strength -= 1; // Bearish
    }
    signals++;
  }
  
  // Moving Average analysis
  if (indicators.shortSMA && indicators.longSMA && 
      indicators.shortSMA.length > 0 && indicators.longSMA.length > 0) {
    const shortMA = indicators.shortSMA[indicators.shortSMA.length - 1];
    const longMA = indicators.longSMA[indicators.longSMA.length - 1];
    
    if (shortMA > longMA) {
      strength += 1; // Bullish
    } else {
      strength -= 1; // Bearish
    }
    signals++;
  }
  
  // Normalize strength (-1 to 1)
  const normalizedStrength = signals > 0 ? strength / signals : 0;
  
  return {
    strength: normalizedStrength,
    signals,
    interpretation: normalizedStrength > 0.3 ? 'BULLISH' : 
                   normalizedStrength < -0.3 ? 'BEARISH' : 'NEUTRAL'
  };
};