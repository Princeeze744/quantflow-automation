export interface Instrument {
  symbol: string
  name: string
  category: 'MAJOR' | 'MINOR' | 'EXOTIC' | 'METAL' | 'ENERGY' | 'INDEX' | 'CRYPTO'
  pipPosition: number  // decimal places for 1 pip (4 for most, 2 for JPY, 1 for gold, etc.)
  contractSize: number // units per 1 standard lot
  quoteCurrency: string
  baseCurrency: string
}

export const instruments: Instrument[] = [
  // === MAJORS ===
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'USD' },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'USD' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'MAJOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'JPY' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CHF' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'USD' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CAD' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'MAJOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'USD' },

  // === MINORS (CROSSES) ===
  { symbol: 'EUR/GBP', name: 'Euro / Pound', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'GBP' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'JPY' },
  { symbol: 'GBP/JPY', name: 'Pound / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'JPY' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'AUD' },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'CAD' },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'CHF' },
  { symbol: 'EUR/NZD', name: 'Euro / New Zealand Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'NZD' },
  { symbol: 'GBP/AUD', name: 'Pound / Australian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'AUD' },
  { symbol: 'GBP/CAD', name: 'Pound / Canadian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'CAD' },
  { symbol: 'GBP/CHF', name: 'Pound / Swiss Franc', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'CHF' },
  { symbol: 'GBP/NZD', name: 'Pound / New Zealand Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'NZD' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'JPY' },
  { symbol: 'AUD/NZD', name: 'Australian Dollar / New Zealand Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'NZD' },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'CAD' },
  { symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'AUD', quoteCurrency: 'CHF' },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'JPY' },
  { symbol: 'NZD/CAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'CAD' },
  { symbol: 'NZD/CHF', name: 'New Zealand Dollar / Swiss Franc', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'NZD', quoteCurrency: 'CHF' },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'CAD', quoteCurrency: 'JPY' },
  { symbol: 'CAD/CHF', name: 'Canadian Dollar / Swiss Franc', category: 'MINOR', pipPosition: 4, contractSize: 100000, baseCurrency: 'CAD', quoteCurrency: 'CHF' },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', category: 'MINOR', pipPosition: 2, contractSize: 100000, baseCurrency: 'CHF', quoteCurrency: 'JPY' },

  // === EXOTICS ===
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'ZAR' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'MXN' },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'TRY' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'SGD' },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'HKD' },
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'SEK' },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'NOK' },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'DKK' },
  { symbol: 'USD/PLN', name: 'US Dollar / Polish Zloty', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'PLN' },
  { symbol: 'USD/HUF', name: 'US Dollar / Hungarian Forint', category: 'EXOTIC', pipPosition: 2, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'HUF' },
  { symbol: 'USD/CZK', name: 'US Dollar / Czech Koruna', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CZK' },
  { symbol: 'USD/CNH', name: 'US Dollar / Chinese Yuan Offshore', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'CNH' },
  { symbol: 'USD/THB', name: 'US Dollar / Thai Baht', category: 'EXOTIC', pipPosition: 2, contractSize: 100000, baseCurrency: 'USD', quoteCurrency: 'THB' },
  { symbol: 'EUR/TRY', name: 'Euro / Turkish Lira', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'TRY' },
  { symbol: 'EUR/ZAR', name: 'Euro / South African Rand', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'ZAR' },
  { symbol: 'EUR/NOK', name: 'Euro / Norwegian Krone', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'NOK' },
  { symbol: 'EUR/SEK', name: 'Euro / Swedish Krona', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'SEK' },
  { symbol: 'EUR/PLN', name: 'Euro / Polish Zloty', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'PLN' },
  { symbol: 'EUR/HUF', name: 'Euro / Hungarian Forint', category: 'EXOTIC', pipPosition: 2, contractSize: 100000, baseCurrency: 'EUR', quoteCurrency: 'HUF' },
  { symbol: 'GBP/ZAR', name: 'Pound / South African Rand', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'ZAR' },
  { symbol: 'GBP/SGD', name: 'Pound / Singapore Dollar', category: 'EXOTIC', pipPosition: 4, contractSize: 100000, baseCurrency: 'GBP', quoteCurrency: 'SGD' },

  // === METALS ===
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'METAL', pipPosition: 1, contractSize: 100, baseCurrency: 'XAU', quoteCurrency: 'USD' },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', category: 'METAL', pipPosition: 3, contractSize: 5000, baseCurrency: 'XAG', quoteCurrency: 'USD' },
  { symbol: 'XPT/USD', name: 'Platinum / US Dollar', category: 'METAL', pipPosition: 1, contractSize: 100, baseCurrency: 'XPT', quoteCurrency: 'USD' },
  { symbol: 'XPD/USD', name: 'Palladium / US Dollar', category: 'METAL', pipPosition: 1, contractSize: 100, baseCurrency: 'XPD', quoteCurrency: 'USD' },

  // === ENERGY ===
  { symbol: 'USOIL', name: 'US Crude Oil (WTI)', category: 'ENERGY', pipPosition: 2, contractSize: 1000, baseCurrency: 'OIL', quoteCurrency: 'USD' },
  { symbol: 'UKOIL', name: 'Brent Crude Oil', category: 'ENERGY', pipPosition: 2, contractSize: 1000, baseCurrency: 'OIL', quoteCurrency: 'USD' },
  { symbol: 'NGAS', name: 'Natural Gas', category: 'ENERGY', pipPosition: 3, contractSize: 10000, baseCurrency: 'GAS', quoteCurrency: 'USD' },

  // === INDICES ===
  { symbol: 'US30', name: 'Dow Jones 30', category: 'INDEX', pipPosition: 0, contractSize: 1, baseCurrency: 'US30', quoteCurrency: 'USD' },
  { symbol: 'US500', name: 'S&P 500', category: 'INDEX', pipPosition: 1, contractSize: 1, baseCurrency: 'US500', quoteCurrency: 'USD' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'INDEX', pipPosition: 1, contractSize: 1, baseCurrency: 'NAS100', quoteCurrency: 'USD' },
  { symbol: 'UK100', name: 'FTSE 100', category: 'INDEX', pipPosition: 1, contractSize: 1, baseCurrency: 'UK100', quoteCurrency: 'GBP' },
  { symbol: 'GER40', name: 'DAX 40', category: 'INDEX', pipPosition: 1, contractSize: 1, baseCurrency: 'GER40', quoteCurrency: 'EUR' },
  { symbol: 'JPN225', name: 'Nikkei 225', category: 'INDEX', pipPosition: 0, contractSize: 1, baseCurrency: 'JPN225', quoteCurrency: 'JPY' },

  // === CRYPTO ===
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'CRYPTO', pipPosition: 1, contractSize: 1, baseCurrency: 'BTC', quoteCurrency: 'USD' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'CRYPTO', pipPosition: 2, contractSize: 1, baseCurrency: 'ETH', quoteCurrency: 'USD' },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'CRYPTO', pipPosition: 2, contractSize: 1, baseCurrency: 'SOL', quoteCurrency: 'USD' },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', category: 'CRYPTO', pipPosition: 4, contractSize: 1, baseCurrency: 'XRP', quoteCurrency: 'USD' },
]

export const getInstrument = (symbol: string): Instrument | undefined => {
  return instruments.find((i) => i.symbol === symbol || i.symbol.replace('/', '') === symbol.replace('/', ''))
}

export const getCategories = () => {
  const cats = [...new Set(instruments.map((i) => i.category))]
  return cats
}

export const getByCategory = (category: string) => {
  return instruments.filter((i) => i.category === category)
}

export const getAllSymbols = () => instruments.map((i) => i.symbol)

// Calculate pip value for a given instrument
export const calculatePipValue = (
  instrument: Instrument,
  lotSize: number,
  accountCurrency: string = 'USD'
): number => {
  const pipSize = 1 / Math.pow(10, instrument.pipPosition)
  const pipValueInQuote = pipSize * instrument.contractSize * lotSize

  // If account currency matches quote currency, pip value is direct
  if (accountCurrency === instrument.quoteCurrency) {
    return pipValueInQuote
  }

  // For USD account and USD quote pairs (EUR/USD, GBP/USD etc.)
  if (accountCurrency === 'USD' && instrument.quoteCurrency === 'USD') {
    return pipValueInQuote
  }

  // For JPY pairs with USD account: approximate conversion
  if (instrument.quoteCurrency === 'JPY' && accountCurrency === 'USD') {
    return pipValueInQuote / 150 // approximate USD/JPY rate
  }

  // Default: return pip value in quote currency (user can mentally convert)
  return pipValueInQuote
}

// Full position size calculation
export const calculatePositionSize = (
  instrument: Instrument,
  accountBalance: number,
  riskPercent: number,
  stopLossPips: number,
  accountCurrency: string = 'USD'
): { lots: number; units: number; riskAmount: number; pipValue: number } => {
  const riskAmount = accountBalance * (riskPercent / 100)

  if (stopLossPips <= 0) {
    return { lots: 0, units: 0, riskAmount, pipValue: 0 }
  }

  // Calculate pip value for 1 standard lot
  const pipValuePerLot = calculatePipValue(instrument, 1, accountCurrency)

  if (pipValuePerLot <= 0) {
    return { lots: 0, units: 0, riskAmount, pipValue: 0 }
  }

  // lots = risk amount / (SL in pips × pip value per lot)
  const lots = riskAmount / (stopLossPips * pipValuePerLot)
  const units = lots * instrument.contractSize

  return {
    lots: Math.round(lots * 100) / 100,
    units: Math.round(units),
    riskAmount: Math.round(riskAmount * 100) / 100,
    pipValue: Math.round(pipValuePerLot * lots * 100) / 100,
  }
}
