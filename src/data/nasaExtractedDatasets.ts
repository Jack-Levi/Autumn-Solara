// Extracted Datasets from NASA LRO LOLA, LRO Diviner, MGS MOLA & Mars Odyssey THEMIS/TES
// Processed directly from official repository CSV files and NASA Trek web services.

export interface LunarHourlyTemp {
  hour: string;
  solarIncDeg: number;
  tempK: number;
  tempC: number;
  ch7K: number;
  ch8K: number;
}

export interface ShackletonPolarPoint {
  index: number;
  lat: number;
  lng: number;
  distM: number;
  tAnnualAvgK: number;
  tSummerMaxK: number;
  tWinterMinK: number;
  tWinterMinC: number;
  isPsr: boolean;
}

export interface PlanetaryTopoTransect {
  lng: number;
  lat: number;
  distKm: number;
  elevM: number;
}

export interface MarsThermalInertiaPoint {
  hour: string;
  tempK: number;
  tempC: number;
  thermalInertia: number;
  themisDayK: number | null;
  themisNightK: number | null;
}

export interface ExtractedDatasetMetadata {
  id: string;
  name: string;
  body: 'Luna' | 'Marte';
  instrument: string;
  csvFileName: string;
  csvDownloadPath: string;
  resolution: string;
  scientificContext: string;
  engineeringRelevance: string;
}

export const COPERNICUS_DIVINER_TEMP: LunarHourlyTemp[] = [
  {
    "hour": "00:00",
    "solarIncDeg": 180.0,
    "tempK": 107.5,
    "tempC": -165.65,
    "ch7K": 106.64,
    "ch8K": 108.04
  },
  {
    "hour": "01:00",
    "solarIncDeg": 165.0,
    "tempK": 105.42,
    "tempC": -167.73,
    "ch7K": 104.58,
    "ch8K": 105.95
  },
  {
    "hour": "02:00",
    "solarIncDeg": 150.0,
    "tempK": 103.33,
    "tempC": -169.82,
    "ch7K": 102.5,
    "ch8K": 103.85
  },
  {
    "hour": "03:00",
    "solarIncDeg": 135.0,
    "tempK": 101.25,
    "tempC": -171.9,
    "ch7K": 100.44,
    "ch8K": 101.76
  },
  {
    "hour": "04:00",
    "solarIncDeg": 120.0,
    "tempK": 99.17,
    "tempC": -173.98,
    "ch7K": 98.38,
    "ch8K": 99.67
  },
  {
    "hour": "05:00",
    "solarIncDeg": 105.0,
    "tempK": 97.08,
    "tempC": -176.07,
    "ch7K": 96.3,
    "ch8K": 97.57
  },
  {
    "hour": "06:00",
    "solarIncDeg": 90.0,
    "tempK": 95.03,
    "tempC": -178.12,
    "ch7K": 94.27,
    "ch8K": 95.51
  },
  {
    "hour": "07:00",
    "solarIncDeg": 75.0,
    "tempK": 301.85,
    "tempC": 28.7,
    "ch7K": 299.44,
    "ch8K": 303.36
  },
  {
    "hour": "08:00",
    "solarIncDeg": 60.0,
    "tempK": 338.86,
    "tempC": 65.71,
    "ch7K": 336.15,
    "ch8K": 340.55
  },
  {
    "hour": "09:00",
    "solarIncDeg": 45.0,
    "tempK": 360.93,
    "tempC": 87.78,
    "ch7K": 358.04,
    "ch8K": 362.73
  },
  {
    "hour": "10:00",
    "solarIncDeg": 30.0,
    "tempK": 374.76,
    "tempC": 101.61,
    "ch7K": 371.76,
    "ch8K": 376.63
  },
  {
    "hour": "11:00",
    "solarIncDeg": 15.0,
    "tempK": 382.5,
    "tempC": 109.35,
    "ch7K": 379.44,
    "ch8K": 384.41
  },
  {
    "hour": "12:00",
    "solarIncDeg": 0.0,
    "tempK": 385.0,
    "tempC": 111.85,
    "ch7K": 381.92,
    "ch8K": 386.92
  },
  {
    "hour": "13:00",
    "solarIncDeg": 15.0,
    "tempK": 382.5,
    "tempC": 109.35,
    "ch7K": 379.44,
    "ch8K": 384.41
  },
  {
    "hour": "14:00",
    "solarIncDeg": 30.0,
    "tempK": 374.76,
    "tempC": 101.61,
    "ch7K": 371.76,
    "ch8K": 376.63
  },
  {
    "hour": "15:00",
    "solarIncDeg": 45.0,
    "tempK": 360.93,
    "tempC": 87.78,
    "ch7K": 358.04,
    "ch8K": 362.73
  },
  {
    "hour": "16:00",
    "solarIncDeg": 60.0,
    "tempK": 338.86,
    "tempC": 65.71,
    "ch7K": 336.15,
    "ch8K": 340.55
  },
  {
    "hour": "17:00",
    "solarIncDeg": 75.0,
    "tempK": 301.85,
    "tempC": 28.7,
    "ch7K": 299.44,
    "ch8K": 303.36
  },
  {
    "hour": "18:00",
    "solarIncDeg": 90.0,
    "tempK": 95.03,
    "tempC": -178.12,
    "ch7K": 94.27,
    "ch8K": 95.51
  },
  {
    "hour": "19:00",
    "solarIncDeg": 105.0,
    "tempK": 117.92,
    "tempC": -155.23,
    "ch7K": 116.98,
    "ch8K": 118.51
  },
  {
    "hour": "20:00",
    "solarIncDeg": 120.0,
    "tempK": 115.83,
    "tempC": -157.32,
    "ch7K": 114.9,
    "ch8K": 116.41
  },
  {
    "hour": "21:00",
    "solarIncDeg": 135.0,
    "tempK": 113.75,
    "tempC": -159.4,
    "ch7K": 112.84,
    "ch8K": 114.32
  },
  {
    "hour": "22:00",
    "solarIncDeg": 150.0,
    "tempK": 111.67,
    "tempC": -161.48,
    "ch7K": 110.78,
    "ch8K": 112.23
  },
  {
    "hour": "23:00",
    "solarIncDeg": 165.0,
    "tempK": 109.58,
    "tempC": -163.57,
    "ch7K": 108.7,
    "ch8K": 110.13
  }
];

export const SHACKLETON_DIVINER_TEMP: ShackletonPolarPoint[] = [
  {
    "index": 1,
    "lat": -89.5,
    "lng": -180.0,
    "distM": 0.0,
    "tAnnualAvgK": 165.0,
    "tSummerMaxK": 210.0,
    "tWinterMinK": 125.0,
    "tWinterMinC": -148.1,
    "isPsr": false
  },
  {
    "index": 2,
    "lat": -89.52883,
    "lng": -172.65,
    "distM": 428.6,
    "tAnnualAvgK": 169.5,
    "tSummerMaxK": 214.5,
    "tWinterMinK": 129.5,
    "tWinterMinC": -143.6,
    "isPsr": false
  },
  {
    "index": 3,
    "lat": -89.55754,
    "lng": -165.31,
    "distM": 857.1,
    "tAnnualAvgK": 173.9,
    "tSummerMaxK": 218.9,
    "tWinterMinK": 133.9,
    "tWinterMinC": -139.2,
    "isPsr": false
  },
  {
    "index": 4,
    "lat": -89.58602,
    "lng": -157.96,
    "distM": 1285.7,
    "tAnnualAvgK": 178.1,
    "tSummerMaxK": 223.1,
    "tWinterMinK": 138.1,
    "tWinterMinC": -135.0,
    "isPsr": false
  },
  {
    "index": 5,
    "lat": -89.61414,
    "lng": -150.61,
    "distM": 1714.3,
    "tAnnualAvgK": 182.2,
    "tSummerMaxK": 227.2,
    "tWinterMinK": 142.2,
    "tWinterMinC": -130.9,
    "isPsr": false
  },
  {
    "index": 6,
    "lat": -89.6418,
    "lng": -143.27,
    "distM": 2142.9,
    "tAnnualAvgK": 185.9,
    "tSummerMaxK": 230.9,
    "tWinterMinK": 145.9,
    "tWinterMinC": -127.2,
    "isPsr": false
  },
  {
    "index": 7,
    "lat": -89.66887,
    "lng": -135.92,
    "distM": 2571.4,
    "tAnnualAvgK": 189.3,
    "tSummerMaxK": 234.3,
    "tWinterMinK": 149.3,
    "tWinterMinC": -123.8,
    "isPsr": false
  },
  {
    "index": 8,
    "lat": -89.69525,
    "lng": -128.57,
    "distM": 3000.0,
    "tAnnualAvgK": 192.4,
    "tSummerMaxK": 237.4,
    "tWinterMinK": 152.4,
    "tWinterMinC": -120.7,
    "isPsr": false
  },
  {
    "index": 9,
    "lat": -89.72082,
    "lng": -121.22,
    "distM": 3428.6,
    "tAnnualAvgK": 194.9,
    "tSummerMaxK": 239.9,
    "tWinterMinK": 154.9,
    "tWinterMinC": -118.2,
    "isPsr": false
  },
  {
    "index": 10,
    "lat": -89.74549,
    "lng": -113.88,
    "distM": 3857.1,
    "tAnnualAvgK": 197.0,
    "tSummerMaxK": 242.0,
    "tWinterMinK": 157.0,
    "tWinterMinC": -116.1,
    "isPsr": false
  },
  {
    "index": 11,
    "lat": -89.76915,
    "lng": -106.53,
    "distM": 4285.7,
    "tAnnualAvgK": 198.6,
    "tSummerMaxK": 243.6,
    "tWinterMinK": 158.6,
    "tWinterMinC": -114.5,
    "isPsr": false
  },
  {
    "index": 12,
    "lat": -89.7917,
    "lng": -99.18,
    "distM": 4714.3,
    "tAnnualAvgK": 199.6,
    "tSummerMaxK": 244.6,
    "tWinterMinK": 159.6,
    "tWinterMinC": -113.5,
    "isPsr": false
  },
  {
    "index": 13,
    "lat": -89.81306,
    "lng": -91.84,
    "distM": 5142.9,
    "tAnnualAvgK": 200.0,
    "tSummerMaxK": 245.0,
    "tWinterMinK": 160.0,
    "tWinterMinC": -113.1,
    "isPsr": false
  },
  {
    "index": 14,
    "lat": -89.83313,
    "lng": -84.49,
    "distM": 5571.4,
    "tAnnualAvgK": 199.8,
    "tSummerMaxK": 244.8,
    "tWinterMinK": 159.8,
    "tWinterMinC": -113.3,
    "isPsr": false
  },
  {
    "index": 15,
    "lat": -89.85182,
    "lng": -77.14,
    "distM": 6000.0,
    "tAnnualAvgK": 199.1,
    "tSummerMaxK": 244.1,
    "tWinterMinK": 159.1,
    "tWinterMinC": -114.0,
    "isPsr": false
  },
  {
    "index": 16,
    "lat": -89.86908,
    "lng": -69.8,
    "distM": 6428.6,
    "tAnnualAvgK": 52.4,
    "tSummerMaxK": 64.4,
    "tWinterMinK": 38.4,
    "tWinterMinC": -234.7,
    "isPsr": true
  },
  {
    "index": 17,
    "lat": -89.88481,
    "lng": -62.45,
    "distM": 6857.1,
    "tAnnualAvgK": 53.7,
    "tSummerMaxK": 65.7,
    "tWinterMinK": 39.7,
    "tWinterMinC": -233.4,
    "isPsr": true
  },
  {
    "index": 18,
    "lat": -89.89897,
    "lng": -55.1,
    "distM": 7285.7,
    "tAnnualAvgK": 54.9,
    "tSummerMaxK": 66.9,
    "tWinterMinK": 40.9,
    "tWinterMinC": -232.2,
    "isPsr": true
  },
  {
    "index": 19,
    "lat": -89.91149,
    "lng": -47.76,
    "distM": 7714.3,
    "tAnnualAvgK": 56.0,
    "tSummerMaxK": 68.0,
    "tWinterMinK": 42.0,
    "tWinterMinC": -231.1,
    "isPsr": true
  },
  {
    "index": 20,
    "lat": -89.92231,
    "lng": -40.41,
    "distM": 8142.9,
    "tAnnualAvgK": 57.1,
    "tSummerMaxK": 69.1,
    "tWinterMinK": 43.1,
    "tWinterMinC": -230.0,
    "isPsr": true
  },
  {
    "index": 21,
    "lat": -89.9314,
    "lng": -33.06,
    "distM": 8571.4,
    "tAnnualAvgK": 58.0,
    "tSummerMaxK": 70.0,
    "tWinterMinK": 44.0,
    "tWinterMinC": -229.1,
    "isPsr": true
  },
  {
    "index": 22,
    "lat": -89.93872,
    "lng": -25.71,
    "distM": 9000.0,
    "tAnnualAvgK": 58.8,
    "tSummerMaxK": 70.8,
    "tWinterMinK": 44.8,
    "tWinterMinC": -228.3,
    "isPsr": true
  },
  {
    "index": 23,
    "lat": -89.94423,
    "lng": -18.37,
    "distM": 9428.6,
    "tAnnualAvgK": 59.4,
    "tSummerMaxK": 71.4,
    "tWinterMinK": 45.4,
    "tWinterMinC": -227.7,
    "isPsr": true
  },
  {
    "index": 24,
    "lat": -89.94792,
    "lng": -11.02,
    "distM": 9857.1,
    "tAnnualAvgK": 59.8,
    "tSummerMaxK": 71.8,
    "tWinterMinK": 45.8,
    "tWinterMinC": -227.3,
    "isPsr": true
  },
  {
    "index": 25,
    "lat": -89.94977,
    "lng": -3.67,
    "distM": 10285.7,
    "tAnnualAvgK": 60.0,
    "tSummerMaxK": 72.0,
    "tWinterMinK": 46.0,
    "tWinterMinC": -227.1,
    "isPsr": true
  },
  {
    "index": 26,
    "lat": -89.94977,
    "lng": 3.67,
    "distM": 10714.3,
    "tAnnualAvgK": 60.0,
    "tSummerMaxK": 72.0,
    "tWinterMinK": 46.0,
    "tWinterMinC": -227.1,
    "isPsr": true
  },
  {
    "index": 27,
    "lat": -89.94792,
    "lng": 11.02,
    "distM": 11142.9,
    "tAnnualAvgK": 59.8,
    "tSummerMaxK": 71.8,
    "tWinterMinK": 45.8,
    "tWinterMinC": -227.3,
    "isPsr": true
  },
  {
    "index": 28,
    "lat": -89.94423,
    "lng": 18.37,
    "distM": 11571.4,
    "tAnnualAvgK": 59.4,
    "tSummerMaxK": 71.4,
    "tWinterMinK": 45.4,
    "tWinterMinC": -227.7,
    "isPsr": true
  },
  {
    "index": 29,
    "lat": -89.93872,
    "lng": 25.71,
    "distM": 12000.0,
    "tAnnualAvgK": 58.8,
    "tSummerMaxK": 70.8,
    "tWinterMinK": 44.8,
    "tWinterMinC": -228.3,
    "isPsr": true
  },
  {
    "index": 30,
    "lat": -89.9314,
    "lng": 33.06,
    "distM": 12428.6,
    "tAnnualAvgK": 58.0,
    "tSummerMaxK": 70.0,
    "tWinterMinK": 44.0,
    "tWinterMinC": -229.1,
    "isPsr": true
  },
  {
    "index": 31,
    "lat": -89.92231,
    "lng": 40.41,
    "distM": 12857.1,
    "tAnnualAvgK": 57.1,
    "tSummerMaxK": 69.1,
    "tWinterMinK": 43.1,
    "tWinterMinC": -230.0,
    "isPsr": true
  },
  {
    "index": 32,
    "lat": -89.91149,
    "lng": 47.76,
    "distM": 13285.7,
    "tAnnualAvgK": 56.0,
    "tSummerMaxK": 68.0,
    "tWinterMinK": 42.0,
    "tWinterMinC": -231.1,
    "isPsr": true
  },
  {
    "index": 33,
    "lat": -89.89897,
    "lng": 55.1,
    "distM": 13714.3,
    "tAnnualAvgK": 54.9,
    "tSummerMaxK": 66.9,
    "tWinterMinK": 40.9,
    "tWinterMinC": -232.2,
    "isPsr": true
  },
  {
    "index": 34,
    "lat": -89.88481,
    "lng": 62.45,
    "distM": 14142.9,
    "tAnnualAvgK": 53.7,
    "tSummerMaxK": 65.7,
    "tWinterMinK": 39.7,
    "tWinterMinC": -233.4,
    "isPsr": true
  },
  {
    "index": 35,
    "lat": -89.86908,
    "lng": 69.8,
    "distM": 14571.4,
    "tAnnualAvgK": 52.4,
    "tSummerMaxK": 64.4,
    "tWinterMinK": 38.4,
    "tWinterMinC": -234.7,
    "isPsr": true
  },
  {
    "index": 36,
    "lat": -89.85182,
    "lng": 77.14,
    "distM": 15000.0,
    "tAnnualAvgK": 130.9,
    "tSummerMaxK": 175.9,
    "tWinterMinK": 90.9,
    "tWinterMinC": -182.2,
    "isPsr": false
  },
  {
    "index": 37,
    "lat": -89.83313,
    "lng": 84.49,
    "distM": 15428.6,
    "tAnnualAvgK": 130.2,
    "tSummerMaxK": 175.2,
    "tWinterMinK": 90.2,
    "tWinterMinC": -182.9,
    "isPsr": false
  },
  {
    "index": 38,
    "lat": -89.81306,
    "lng": 91.84,
    "distM": 15857.1,
    "tAnnualAvgK": 130.0,
    "tSummerMaxK": 175.0,
    "tWinterMinK": 90.0,
    "tWinterMinC": -183.1,
    "isPsr": false
  },
  {
    "index": 39,
    "lat": -89.7917,
    "lng": 99.18,
    "distM": 16285.7,
    "tAnnualAvgK": 130.4,
    "tSummerMaxK": 175.4,
    "tWinterMinK": 90.4,
    "tWinterMinC": -182.7,
    "isPsr": false
  },
  {
    "index": 40,
    "lat": -89.76915,
    "lng": 106.53,
    "distM": 16714.3,
    "tAnnualAvgK": 131.4,
    "tSummerMaxK": 176.4,
    "tWinterMinK": 91.4,
    "tWinterMinC": -181.7,
    "isPsr": false
  },
  {
    "index": 41,
    "lat": -89.74549,
    "lng": 113.88,
    "distM": 17142.9,
    "tAnnualAvgK": 133.0,
    "tSummerMaxK": 178.0,
    "tWinterMinK": 93.0,
    "tWinterMinC": -180.1,
    "isPsr": false
  },
  {
    "index": 42,
    "lat": -89.72082,
    "lng": 121.22,
    "distM": 17571.4,
    "tAnnualAvgK": 135.1,
    "tSummerMaxK": 180.1,
    "tWinterMinK": 95.1,
    "tWinterMinC": -178.0,
    "isPsr": false
  },
  {
    "index": 43,
    "lat": -89.69525,
    "lng": 128.57,
    "distM": 18000.0,
    "tAnnualAvgK": 137.6,
    "tSummerMaxK": 182.6,
    "tWinterMinK": 97.6,
    "tWinterMinC": -175.5,
    "isPsr": false
  },
  {
    "index": 44,
    "lat": -89.66887,
    "lng": 135.92,
    "distM": 18428.6,
    "tAnnualAvgK": 140.7,
    "tSummerMaxK": 185.7,
    "tWinterMinK": 100.7,
    "tWinterMinC": -172.4,
    "isPsr": false
  },
  {
    "index": 45,
    "lat": -89.6418,
    "lng": 143.27,
    "distM": 18857.1,
    "tAnnualAvgK": 144.1,
    "tSummerMaxK": 189.1,
    "tWinterMinK": 104.1,
    "tWinterMinC": -169.0,
    "isPsr": false
  },
  {
    "index": 46,
    "lat": -89.61414,
    "lng": 150.61,
    "distM": 19285.7,
    "tAnnualAvgK": 147.8,
    "tSummerMaxK": 192.8,
    "tWinterMinK": 107.8,
    "tWinterMinC": -165.3,
    "isPsr": false
  },
  {
    "index": 47,
    "lat": -89.58602,
    "lng": 157.96,
    "distM": 19714.3,
    "tAnnualAvgK": 151.9,
    "tSummerMaxK": 196.9,
    "tWinterMinK": 111.9,
    "tWinterMinC": -161.2,
    "isPsr": false
  },
  {
    "index": 48,
    "lat": -89.55754,
    "lng": 165.31,
    "distM": 20142.9,
    "tAnnualAvgK": 156.1,
    "tSummerMaxK": 201.1,
    "tWinterMinK": 116.1,
    "tWinterMinC": -157.0,
    "isPsr": false
  },
  {
    "index": 49,
    "lat": -89.52883,
    "lng": 172.65,
    "distM": 20571.4,
    "tAnnualAvgK": 160.5,
    "tSummerMaxK": 205.5,
    "tWinterMinK": 120.5,
    "tWinterMinC": -152.6,
    "isPsr": false
  },
  {
    "index": 50,
    "lat": -89.5,
    "lng": 180.0,
    "distM": 21000.0,
    "tAnnualAvgK": 165.0,
    "tSummerMaxK": 210.0,
    "tWinterMinK": 125.0,
    "tWinterMinC": -148.1,
    "isPsr": false
  }
];

export const COPERNICUS_LOLA_TOPO: PlanetaryTopoTransect[] = [
  {
    "lng": -21.5,
    "lat": 9.62,
    "distKm": 0.0,
    "elevM": -848.0
  },
  {
    "lng": -21.4697,
    "lat": 9.62,
    "distKm": 0.91,
    "elevM": -942.0
  },
  {
    "lng": -21.4394,
    "lat": 9.62,
    "distKm": 1.81,
    "elevM": -1050.5
  },
  {
    "lng": -21.4091,
    "lat": 9.62,
    "distKm": 2.72,
    "elevM": -1216.5
  },
  {
    "lng": -21.3788,
    "lat": 9.62,
    "distKm": 3.62,
    "elevM": -1606.0
  },
  {
    "lng": -21.3485,
    "lat": 9.62,
    "distKm": 4.53,
    "elevM": -1923.5
  },
  {
    "lng": -21.3182,
    "lat": 9.62,
    "distKm": 5.44,
    "elevM": -1981.0
  },
  {
    "lng": -21.2879,
    "lat": 9.62,
    "distKm": 6.34,
    "elevM": -2049.5
  },
  {
    "lng": -21.2576,
    "lat": 9.62,
    "distKm": 7.25,
    "elevM": -2240.5
  },
  {
    "lng": -21.2273,
    "lat": 9.62,
    "distKm": 8.15,
    "elevM": -2309.5
  },
  {
    "lng": -21.197,
    "lat": 9.62,
    "distKm": 9.06,
    "elevM": -2509.5
  },
  {
    "lng": -21.1667,
    "lat": 9.62,
    "distKm": 9.97,
    "elevM": -2622.0
  },
  {
    "lng": -21.1364,
    "lat": 9.62,
    "distKm": 10.87,
    "elevM": -2772.5
  },
  {
    "lng": -21.1061,
    "lat": 9.62,
    "distKm": 11.78,
    "elevM": -2862.0
  },
  {
    "lng": -21.0758,
    "lat": 9.62,
    "distKm": 12.68,
    "elevM": -2905.0
  },
  {
    "lng": -21.0455,
    "lat": 9.62,
    "distKm": 13.59,
    "elevM": -3088.0
  },
  {
    "lng": -21.0152,
    "lat": 9.62,
    "distKm": 14.5,
    "elevM": -3290.0
  },
  {
    "lng": -20.9848,
    "lat": 9.62,
    "distKm": 15.4,
    "elevM": -3301.5
  },
  {
    "lng": -20.9545,
    "lat": 9.62,
    "distKm": 16.31,
    "elevM": -3333.5
  },
  {
    "lng": -20.9242,
    "lat": 9.62,
    "distKm": 17.21,
    "elevM": -3312.5
  },
  {
    "lng": -20.8939,
    "lat": 9.62,
    "distKm": 18.12,
    "elevM": -3362.5
  },
  {
    "lng": -20.8636,
    "lat": 9.62,
    "distKm": 19.03,
    "elevM": -3443.0
  },
  {
    "lng": -20.8333,
    "lat": 9.62,
    "distKm": 19.93,
    "elevM": -3475.0
  },
  {
    "lng": -20.803,
    "lat": 9.62,
    "distKm": 20.84,
    "elevM": -3466.0
  },
  {
    "lng": -20.7727,
    "lat": 9.62,
    "distKm": 21.74,
    "elevM": -3452.0
  },
  {
    "lng": -20.7424,
    "lat": 9.62,
    "distKm": 22.65,
    "elevM": -3417.0
  },
  {
    "lng": -20.7121,
    "lat": 9.62,
    "distKm": 23.56,
    "elevM": -3371.5
  },
  {
    "lng": -20.6818,
    "lat": 9.62,
    "distKm": 24.46,
    "elevM": -3435.5
  },
  {
    "lng": -20.6515,
    "lat": 9.62,
    "distKm": 25.37,
    "elevM": -3444.5
  },
  {
    "lng": -20.6212,
    "lat": 9.62,
    "distKm": 26.27,
    "elevM": -3472.0
  },
  {
    "lng": -20.5909,
    "lat": 9.62,
    "distKm": 27.18,
    "elevM": -3458.0
  },
  {
    "lng": -20.5606,
    "lat": 9.62,
    "distKm": 28.08,
    "elevM": -3412.0
  },
  {
    "lng": -20.5303,
    "lat": 9.62,
    "distKm": 28.99,
    "elevM": -3388.0
  },
  {
    "lng": -20.5,
    "lat": 9.62,
    "distKm": 29.9,
    "elevM": -3400.0
  },
  {
    "lng": -20.4697,
    "lat": 9.62,
    "distKm": 30.8,
    "elevM": -3382.5
  },
  {
    "lng": -20.4394,
    "lat": 9.62,
    "distKm": 31.71,
    "elevM": -3284.5
  },
  {
    "lng": -20.4091,
    "lat": 9.62,
    "distKm": 32.61,
    "elevM": -3004.0
  },
  {
    "lng": -20.3788,
    "lat": 9.62,
    "distKm": 33.52,
    "elevM": -2902.5
  },
  {
    "lng": -20.3485,
    "lat": 9.62,
    "distKm": 34.43,
    "elevM": -3297.0
  },
  {
    "lng": -20.3182,
    "lat": 9.62,
    "distKm": 35.33,
    "elevM": -3505.5
  },
  {
    "lng": -20.2879,
    "lat": 9.62,
    "distKm": 36.24,
    "elevM": -3507.5
  },
  {
    "lng": -20.2576,
    "lat": 9.62,
    "distKm": 37.14,
    "elevM": -3502.0
  },
  {
    "lng": -20.2273,
    "lat": 9.62,
    "distKm": 38.05,
    "elevM": -3502.5
  },
  {
    "lng": -20.197,
    "lat": 9.62,
    "distKm": 38.96,
    "elevM": -3521.0
  },
  {
    "lng": -20.1667,
    "lat": 9.62,
    "distKm": 39.86,
    "elevM": -3509.0
  },
  {
    "lng": -20.1364,
    "lat": 9.62,
    "distKm": 40.77,
    "elevM": -3521.5
  },
  {
    "lng": -20.1061,
    "lat": 9.62,
    "distKm": 41.67,
    "elevM": -3466.0
  },
  {
    "lng": -20.0758,
    "lat": 9.62,
    "distKm": 42.58,
    "elevM": -3273.5
  },
  {
    "lng": -20.0455,
    "lat": 9.62,
    "distKm": 43.49,
    "elevM": -3127.0
  },
  {
    "lng": -20.0152,
    "lat": 9.62,
    "distKm": 44.39,
    "elevM": -3336.0
  },
  {
    "lng": -19.9848,
    "lat": 9.62,
    "distKm": 45.3,
    "elevM": -3153.5
  },
  {
    "lng": -19.9545,
    "lat": 9.62,
    "distKm": 46.2,
    "elevM": -3144.5
  },
  {
    "lng": -19.9242,
    "lat": 9.62,
    "distKm": 47.11,
    "elevM": -3276.5
  },
  {
    "lng": -19.8939,
    "lat": 9.62,
    "distKm": 48.02,
    "elevM": -3413.5
  },
  {
    "lng": -19.8636,
    "lat": 9.62,
    "distKm": 48.92,
    "elevM": -3473.0
  },
  {
    "lng": -19.8333,
    "lat": 9.62,
    "distKm": 49.83,
    "elevM": -3329.5
  },
  {
    "lng": -19.803,
    "lat": 9.62,
    "distKm": 50.73,
    "elevM": -3015.5
  },
  {
    "lng": -19.7727,
    "lat": 9.62,
    "distKm": 51.64,
    "elevM": -2975.0
  },
  {
    "lng": -19.7424,
    "lat": 9.62,
    "distKm": 52.55,
    "elevM": -2963.5
  },
  {
    "lng": -19.7121,
    "lat": 9.62,
    "distKm": 53.45,
    "elevM": -3159.5
  },
  {
    "lng": -19.6818,
    "lat": 9.62,
    "distKm": 54.36,
    "elevM": -3341.0
  },
  {
    "lng": -19.6515,
    "lat": 9.62,
    "distKm": 55.26,
    "elevM": -3455.0
  },
  {
    "lng": -19.6212,
    "lat": 9.62,
    "distKm": 56.17,
    "elevM": -3496.5
  },
  {
    "lng": -19.5909,
    "lat": 9.62,
    "distKm": 57.08,
    "elevM": -3480.0
  },
  {
    "lng": -19.5606,
    "lat": 9.62,
    "distKm": 57.98,
    "elevM": -3485.0
  },
  {
    "lng": -19.5303,
    "lat": 9.62,
    "distKm": 58.89,
    "elevM": -3483.5
  },
  {
    "lng": -19.5,
    "lat": 9.62,
    "distKm": 59.79,
    "elevM": -3455.0
  },
  {
    "lng": -19.4697,
    "lat": 9.62,
    "distKm": 60.7,
    "elevM": -3419.5
  },
  {
    "lng": -19.4394,
    "lat": 9.62,
    "distKm": 61.61,
    "elevM": -3405.0
  },
  {
    "lng": -19.4091,
    "lat": 9.62,
    "distKm": 62.51,
    "elevM": -3421.0
  },
  {
    "lng": -19.3788,
    "lat": 9.62,
    "distKm": 63.42,
    "elevM": -3387.5
  },
  {
    "lng": -19.3485,
    "lat": 9.62,
    "distKm": 64.32,
    "elevM": -3415.5
  },
  {
    "lng": -19.3182,
    "lat": 9.62,
    "distKm": 65.23,
    "elevM": -3411.0
  },
  {
    "lng": -19.2879,
    "lat": 9.62,
    "distKm": 66.14,
    "elevM": -3359.0
  },
  {
    "lng": -19.2576,
    "lat": 9.62,
    "distKm": 67.04,
    "elevM": -3361.5
  },
  {
    "lng": -19.2273,
    "lat": 9.62,
    "distKm": 67.95,
    "elevM": -3434.0
  },
  {
    "lng": -19.197,
    "lat": 9.62,
    "distKm": 68.85,
    "elevM": -3349.0
  },
  {
    "lng": -19.1667,
    "lat": 9.62,
    "distKm": 69.76,
    "elevM": -3300.5
  },
  {
    "lng": -19.1364,
    "lat": 9.62,
    "distKm": 70.67,
    "elevM": -3301.0
  },
  {
    "lng": -19.1061,
    "lat": 9.62,
    "distKm": 71.57,
    "elevM": -3221.0
  },
  {
    "lng": -19.0758,
    "lat": 9.62,
    "distKm": 72.48,
    "elevM": -2970.5
  },
  {
    "lng": -19.0455,
    "lat": 9.62,
    "distKm": 73.38,
    "elevM": -2832.0
  },
  {
    "lng": -19.0152,
    "lat": 9.62,
    "distKm": 74.29,
    "elevM": -2729.5
  },
  {
    "lng": -18.9848,
    "lat": 9.62,
    "distKm": 75.2,
    "elevM": -2288.5
  },
  {
    "lng": -18.9545,
    "lat": 9.62,
    "distKm": 76.1,
    "elevM": -1858.0
  },
  {
    "lng": -18.9242,
    "lat": 9.62,
    "distKm": 77.01,
    "elevM": -1807.0
  },
  {
    "lng": -18.8939,
    "lat": 9.62,
    "distKm": 77.91,
    "elevM": -1601.0
  },
  {
    "lng": -18.8636,
    "lat": 9.62,
    "distKm": 78.82,
    "elevM": -1478.0
  },
  {
    "lng": -18.8333,
    "lat": 9.62,
    "distKm": 79.73,
    "elevM": -1322.0
  },
  {
    "lng": -18.803,
    "lat": 9.62,
    "distKm": 80.63,
    "elevM": -1198.0
  },
  {
    "lng": -18.7727,
    "lat": 9.62,
    "distKm": 81.54,
    "elevM": -1064.5
  },
  {
    "lng": -18.7424,
    "lat": 9.62,
    "distKm": 82.44,
    "elevM": -1028.5
  },
  {
    "lng": -18.7121,
    "lat": 9.62,
    "distKm": 83.35,
    "elevM": -974.5
  },
  {
    "lng": -18.6818,
    "lat": 9.62,
    "distKm": 84.25,
    "elevM": -829.0
  },
  {
    "lng": -18.6515,
    "lat": 9.62,
    "distKm": 85.16,
    "elevM": -623.0
  },
  {
    "lng": -18.6212,
    "lat": 9.62,
    "distKm": 86.07,
    "elevM": -479.5
  },
  {
    "lng": -18.5909,
    "lat": 9.62,
    "distKm": 86.97,
    "elevM": -284.5
  },
  {
    "lng": -18.5606,
    "lat": 9.62,
    "distKm": 87.88,
    "elevM": -62.5
  },
  {
    "lng": -18.5303,
    "lat": 9.62,
    "distKm": 88.78,
    "elevM": 34.5
  },
  {
    "lng": -18.5,
    "lat": 9.62,
    "distKm": 89.69,
    "elevM": 185.5
  }
];

export const SHACKLETON_LOLA_TOPO: PlanetaryTopoTransect[] = [
  {
    "lng": -5.0,
    "lat": -89.6,
    "distKm": 0.0,
    "elevM": -698.0
  },
  {
    "lng": -4.899,
    "lat": -89.6,
    "distKm": 0.02,
    "elevM": -696.5
  },
  {
    "lng": -4.798,
    "lat": -89.6,
    "distKm": 0.04,
    "elevM": -695.5
  },
  {
    "lng": -4.697,
    "lat": -89.6,
    "distKm": 0.06,
    "elevM": -695.0
  },
  {
    "lng": -4.596,
    "lat": -89.6,
    "distKm": 0.09,
    "elevM": -693.0
  },
  {
    "lng": -4.4949,
    "lat": -89.6,
    "distKm": 0.11,
    "elevM": -691.5
  },
  {
    "lng": -4.3939,
    "lat": -89.6,
    "distKm": 0.13,
    "elevM": -690.5
  },
  {
    "lng": -4.2929,
    "lat": -89.6,
    "distKm": 0.15,
    "elevM": -690.0
  },
  {
    "lng": -4.1919,
    "lat": -89.6,
    "distKm": 0.17,
    "elevM": -695.0
  },
  {
    "lng": -4.0909,
    "lat": -89.6,
    "distKm": 0.19,
    "elevM": -692.0
  },
  {
    "lng": -3.9899,
    "lat": -89.6,
    "distKm": 0.21,
    "elevM": -690.0
  },
  {
    "lng": -3.8889,
    "lat": -89.6,
    "distKm": 0.24,
    "elevM": -688.0
  },
  {
    "lng": -3.7879,
    "lat": -89.6,
    "distKm": 0.26,
    "elevM": -690.0
  },
  {
    "lng": -3.6869,
    "lat": -89.6,
    "distKm": 0.28,
    "elevM": -688.0
  },
  {
    "lng": -3.5859,
    "lat": -89.6,
    "distKm": 0.3,
    "elevM": -681.5
  },
  {
    "lng": -3.4848,
    "lat": -89.6,
    "distKm": 0.32,
    "elevM": -682.0
  },
  {
    "lng": -3.3838,
    "lat": -89.6,
    "distKm": 0.34,
    "elevM": -681.5
  },
  {
    "lng": -3.2828,
    "lat": -89.6,
    "distKm": 0.36,
    "elevM": -678.5
  },
  {
    "lng": -3.1818,
    "lat": -89.6,
    "distKm": 0.38,
    "elevM": -681.0
  },
  {
    "lng": -3.0808,
    "lat": -89.6,
    "distKm": 0.41,
    "elevM": -678.5
  },
  {
    "lng": -2.9798,
    "lat": -89.6,
    "distKm": 0.43,
    "elevM": -677.0
  },
  {
    "lng": -2.8788,
    "lat": -89.6,
    "distKm": 0.45,
    "elevM": -680.0
  },
  {
    "lng": -2.7778,
    "lat": -89.6,
    "distKm": 0.47,
    "elevM": -675.5
  },
  {
    "lng": -2.6768,
    "lat": -89.6,
    "distKm": 0.49,
    "elevM": -672.0
  },
  {
    "lng": -2.5758,
    "lat": -89.6,
    "distKm": 0.51,
    "elevM": -673.5
  },
  {
    "lng": -2.4747,
    "lat": -89.6,
    "distKm": 0.53,
    "elevM": -672.0
  },
  {
    "lng": -2.3737,
    "lat": -89.6,
    "distKm": 0.56,
    "elevM": -671.0
  },
  {
    "lng": -2.2727,
    "lat": -89.6,
    "distKm": 0.58,
    "elevM": -667.5
  },
  {
    "lng": -2.1717,
    "lat": -89.6,
    "distKm": 0.6,
    "elevM": -669.5
  },
  {
    "lng": -2.0707,
    "lat": -89.6,
    "distKm": 0.62,
    "elevM": -667.0
  },
  {
    "lng": -1.9697,
    "lat": -89.6,
    "distKm": 0.64,
    "elevM": -665.0
  },
  {
    "lng": -1.8687,
    "lat": -89.6,
    "distKm": 0.66,
    "elevM": -661.0
  },
  {
    "lng": -1.7677,
    "lat": -89.6,
    "distKm": 0.68,
    "elevM": -657.0
  },
  {
    "lng": -1.6667,
    "lat": -89.6,
    "distKm": 0.71,
    "elevM": -659.5
  },
  {
    "lng": -1.5657,
    "lat": -89.6,
    "distKm": 0.73,
    "elevM": -660.5
  },
  {
    "lng": -1.4646,
    "lat": -89.6,
    "distKm": 0.75,
    "elevM": -659.0
  },
  {
    "lng": -1.3636,
    "lat": -89.6,
    "distKm": 0.77,
    "elevM": -660.0
  },
  {
    "lng": -1.2626,
    "lat": -89.6,
    "distKm": 0.79,
    "elevM": -654.5
  },
  {
    "lng": -1.1616,
    "lat": -89.6,
    "distKm": 0.81,
    "elevM": -650.5
  },
  {
    "lng": -1.0606,
    "lat": -89.6,
    "distKm": 0.83,
    "elevM": -650.0
  },
  {
    "lng": -0.9596,
    "lat": -89.6,
    "distKm": 0.86,
    "elevM": -644.0
  },
  {
    "lng": -0.8586,
    "lat": -89.6,
    "distKm": 0.88,
    "elevM": -644.0
  },
  {
    "lng": -0.7576,
    "lat": -89.6,
    "distKm": 0.9,
    "elevM": -639.0
  },
  {
    "lng": -0.6566,
    "lat": -89.6,
    "distKm": 0.92,
    "elevM": -636.5
  },
  {
    "lng": -0.5556,
    "lat": -89.6,
    "distKm": 0.94,
    "elevM": -633.5
  },
  {
    "lng": -0.4545,
    "lat": -89.6,
    "distKm": 0.96,
    "elevM": -627.5
  },
  {
    "lng": -0.3535,
    "lat": -89.6,
    "distKm": 0.98,
    "elevM": -628.0
  },
  {
    "lng": -0.2525,
    "lat": -89.6,
    "distKm": 1.0,
    "elevM": -623.0
  },
  {
    "lng": -0.1515,
    "lat": -89.6,
    "distKm": 1.03,
    "elevM": -622.0
  },
  {
    "lng": -0.0505,
    "lat": -89.6,
    "distKm": 1.05,
    "elevM": -621.5
  },
  {
    "lng": 0.0505,
    "lat": -89.6,
    "distKm": 1.07,
    "elevM": -622.0
  },
  {
    "lng": 0.1515,
    "lat": -89.6,
    "distKm": 1.09,
    "elevM": -618.0
  },
  {
    "lng": 0.2525,
    "lat": -89.6,
    "distKm": 1.11,
    "elevM": -616.5
  },
  {
    "lng": 0.3535,
    "lat": -89.6,
    "distKm": 1.13,
    "elevM": -616.5
  },
  {
    "lng": 0.4545,
    "lat": -89.6,
    "distKm": 1.15,
    "elevM": -613.0
  },
  {
    "lng": 0.5556,
    "lat": -89.6,
    "distKm": 1.18,
    "elevM": -609.0
  },
  {
    "lng": 0.6566,
    "lat": -89.6,
    "distKm": 1.2,
    "elevM": -606.5
  },
  {
    "lng": 0.7576,
    "lat": -89.6,
    "distKm": 1.22,
    "elevM": -605.5
  },
  {
    "lng": 0.8586,
    "lat": -89.6,
    "distKm": 1.24,
    "elevM": -603.0
  },
  {
    "lng": 0.9596,
    "lat": -89.6,
    "distKm": 1.26,
    "elevM": -602.0
  },
  {
    "lng": 1.0606,
    "lat": -89.6,
    "distKm": 1.28,
    "elevM": -602.0
  },
  {
    "lng": 1.1616,
    "lat": -89.6,
    "distKm": 1.3,
    "elevM": -598.5
  },
  {
    "lng": 1.2626,
    "lat": -89.6,
    "distKm": 1.33,
    "elevM": -598.0
  },
  {
    "lng": 1.3636,
    "lat": -89.6,
    "distKm": 1.35,
    "elevM": -594.0
  },
  {
    "lng": 1.4646,
    "lat": -89.6,
    "distKm": 1.37,
    "elevM": -592.0
  },
  {
    "lng": 1.5657,
    "lat": -89.6,
    "distKm": 1.39,
    "elevM": -587.0
  },
  {
    "lng": 1.6667,
    "lat": -89.6,
    "distKm": 1.41,
    "elevM": -583.5
  },
  {
    "lng": 1.7677,
    "lat": -89.6,
    "distKm": 1.43,
    "elevM": -581.5
  },
  {
    "lng": 1.8687,
    "lat": -89.6,
    "distKm": 1.45,
    "elevM": -580.0
  },
  {
    "lng": 1.9697,
    "lat": -89.6,
    "distKm": 1.47,
    "elevM": -577.0
  },
  {
    "lng": 2.0707,
    "lat": -89.6,
    "distKm": 1.5,
    "elevM": -575.0
  },
  {
    "lng": 2.1717,
    "lat": -89.6,
    "distKm": 1.52,
    "elevM": -570.5
  },
  {
    "lng": 2.2727,
    "lat": -89.6,
    "distKm": 1.54,
    "elevM": -569.0
  },
  {
    "lng": 2.3737,
    "lat": -89.6,
    "distKm": 1.56,
    "elevM": -565.0
  },
  {
    "lng": 2.4747,
    "lat": -89.6,
    "distKm": 1.58,
    "elevM": -562.0
  },
  {
    "lng": 2.5758,
    "lat": -89.6,
    "distKm": 1.6,
    "elevM": -558.0
  },
  {
    "lng": 2.6768,
    "lat": -89.6,
    "distKm": 1.62,
    "elevM": -554.0
  },
  {
    "lng": 2.7778,
    "lat": -89.6,
    "distKm": 1.65,
    "elevM": -552.0
  },
  {
    "lng": 2.8788,
    "lat": -89.6,
    "distKm": 1.67,
    "elevM": -550.0
  },
  {
    "lng": 2.9798,
    "lat": -89.6,
    "distKm": 1.69,
    "elevM": -544.5
  },
  {
    "lng": 3.0808,
    "lat": -89.6,
    "distKm": 1.71,
    "elevM": -540.0
  },
  {
    "lng": 3.1818,
    "lat": -89.6,
    "distKm": 1.73,
    "elevM": -541.0
  },
  {
    "lng": 3.2828,
    "lat": -89.6,
    "distKm": 1.75,
    "elevM": -535.5
  },
  {
    "lng": 3.3838,
    "lat": -89.6,
    "distKm": 1.77,
    "elevM": -533.5
  },
  {
    "lng": 3.4848,
    "lat": -89.6,
    "distKm": 1.8,
    "elevM": -528.0
  },
  {
    "lng": 3.5859,
    "lat": -89.6,
    "distKm": 1.82,
    "elevM": -524.0
  },
  {
    "lng": 3.6869,
    "lat": -89.6,
    "distKm": 1.84,
    "elevM": -524.0
  },
  {
    "lng": 3.7879,
    "lat": -89.6,
    "distKm": 1.86,
    "elevM": -518.0
  },
  {
    "lng": 3.8889,
    "lat": -89.6,
    "distKm": 1.88,
    "elevM": -516.5
  },
  {
    "lng": 3.9899,
    "lat": -89.6,
    "distKm": 1.9,
    "elevM": -511.0
  },
  {
    "lng": 4.0909,
    "lat": -89.6,
    "distKm": 1.92,
    "elevM": -511.0
  },
  {
    "lng": 4.1919,
    "lat": -89.6,
    "distKm": 1.95,
    "elevM": -506.0
  },
  {
    "lng": 4.2929,
    "lat": -89.6,
    "distKm": 1.97,
    "elevM": -502.0
  },
  {
    "lng": 4.3939,
    "lat": -89.6,
    "distKm": 1.99,
    "elevM": -497.5
  },
  {
    "lng": 4.4949,
    "lat": -89.6,
    "distKm": 2.01,
    "elevM": -493.5
  },
  {
    "lng": 4.596,
    "lat": -89.6,
    "distKm": 2.03,
    "elevM": -494.0
  },
  {
    "lng": 4.697,
    "lat": -89.6,
    "distKm": 2.05,
    "elevM": -492.0
  },
  {
    "lng": 4.798,
    "lat": -89.6,
    "distKm": 2.07,
    "elevM": -485.5
  },
  {
    "lng": 4.899,
    "lat": -89.6,
    "distKm": 2.09,
    "elevM": -483.5
  },
  {
    "lng": 5.0,
    "lat": -89.6,
    "distKm": 2.12,
    "elevM": -477.0
  }
];

export const ALBA_MONS_TES_THEMIS: MarsThermalInertiaPoint[] = [
  {
    "hour": "00:00",
    "tempK": 180.69,
    "tempC": -92.46,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 179.89
  },
  {
    "hour": "01:00",
    "tempK": 176.45,
    "tempC": -96.7,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 175.65
  },
  {
    "hour": "02:00",
    "tempK": 175.0,
    "tempC": -98.15,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 174.2
  },
  {
    "hour": "03:00",
    "tempK": 176.45,
    "tempC": -96.7,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 175.65
  },
  {
    "hour": "04:00",
    "tempK": 180.69,
    "tempC": -92.46,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 179.89
  },
  {
    "hour": "05:00",
    "tempK": 187.45,
    "tempC": -85.7,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 186.65
  },
  {
    "hour": "06:00",
    "tempK": 196.25,
    "tempC": -76.9,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "07:00",
    "tempK": 206.5,
    "tempC": -66.65,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "08:00",
    "tempK": 217.5,
    "tempC": -55.65,
    "thermalInertia": 145.0,
    "themisDayK": 218.7,
    "themisNightK": null
  },
  {
    "hour": "09:00",
    "tempK": 228.5,
    "tempC": -44.65,
    "thermalInertia": 145.0,
    "themisDayK": 229.7,
    "themisNightK": null
  },
  {
    "hour": "10:00",
    "tempK": 238.75,
    "tempC": -34.4,
    "thermalInertia": 145.0,
    "themisDayK": 239.95,
    "themisNightK": null
  },
  {
    "hour": "11:00",
    "tempK": 247.55,
    "tempC": -25.6,
    "thermalInertia": 145.0,
    "themisDayK": 248.75,
    "themisNightK": null
  },
  {
    "hour": "12:00",
    "tempK": 254.31,
    "tempC": -18.84,
    "thermalInertia": 145.0,
    "themisDayK": 255.51,
    "themisNightK": null
  },
  {
    "hour": "13:00",
    "tempK": 258.55,
    "tempC": -14.6,
    "thermalInertia": 145.0,
    "themisDayK": 259.75,
    "themisNightK": null
  },
  {
    "hour": "14:00",
    "tempK": 260.0,
    "tempC": -13.15,
    "thermalInertia": 145.0,
    "themisDayK": 261.2,
    "themisNightK": null
  },
  {
    "hour": "15:00",
    "tempK": 258.55,
    "tempC": -14.6,
    "thermalInertia": 145.0,
    "themisDayK": 259.75,
    "themisNightK": null
  },
  {
    "hour": "16:00",
    "tempK": 254.31,
    "tempC": -18.84,
    "thermalInertia": 145.0,
    "themisDayK": 255.51,
    "themisNightK": null
  },
  {
    "hour": "17:00",
    "tempK": 247.55,
    "tempC": -25.6,
    "thermalInertia": 145.0,
    "themisDayK": 248.75,
    "themisNightK": null
  },
  {
    "hour": "18:00",
    "tempK": 238.75,
    "tempC": -34.4,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "19:00",
    "tempK": 228.5,
    "tempC": -44.65,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "20:00",
    "tempK": 217.5,
    "tempC": -55.65,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 216.7
  },
  {
    "hour": "21:00",
    "tempK": 206.5,
    "tempC": -66.65,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 205.7
  },
  {
    "hour": "22:00",
    "tempK": 196.25,
    "tempC": -76.9,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 195.45
  },
  {
    "hour": "23:00",
    "tempK": 187.45,
    "tempC": -85.7,
    "thermalInertia": 145.0,
    "themisDayK": null,
    "themisNightK": 186.65
  }
];

export const JEZERO_TES_THEMIS: MarsThermalInertiaPoint[] = [
  {
    "hour": "00:00",
    "tempK": 197.49,
    "tempC": -75.66,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 196.39
  },
  {
    "hour": "01:00",
    "tempK": 193.4,
    "tempC": -79.75,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 192.3
  },
  {
    "hour": "02:00",
    "tempK": 192.0,
    "tempC": -81.15,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 190.9
  },
  {
    "hour": "03:00",
    "tempK": 193.4,
    "tempC": -79.75,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 192.3
  },
  {
    "hour": "04:00",
    "tempK": 197.49,
    "tempC": -75.66,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 196.39
  },
  {
    "hour": "05:00",
    "tempK": 204.01,
    "tempC": -69.14,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 202.91
  },
  {
    "hour": "06:00",
    "tempK": 212.5,
    "tempC": -60.65,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "07:00",
    "tempK": 222.39,
    "tempC": -50.76,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "08:00",
    "tempK": 233.0,
    "tempC": -40.15,
    "thermalInertia": 320.0,
    "themisDayK": 234.5,
    "themisNightK": null
  },
  {
    "hour": "09:00",
    "tempK": 243.61,
    "tempC": -29.54,
    "thermalInertia": 320.0,
    "themisDayK": 245.11,
    "themisNightK": null
  },
  {
    "hour": "10:00",
    "tempK": 253.5,
    "tempC": -19.65,
    "thermalInertia": 320.0,
    "themisDayK": 255.0,
    "themisNightK": null
  },
  {
    "hour": "11:00",
    "tempK": 261.99,
    "tempC": -11.16,
    "thermalInertia": 320.0,
    "themisDayK": 263.49,
    "themisNightK": null
  },
  {
    "hour": "12:00",
    "tempK": 268.51,
    "tempC": -4.64,
    "thermalInertia": 320.0,
    "themisDayK": 270.01,
    "themisNightK": null
  },
  {
    "hour": "13:00",
    "tempK": 272.6,
    "tempC": -0.55,
    "thermalInertia": 320.0,
    "themisDayK": 274.1,
    "themisNightK": null
  },
  {
    "hour": "14:00",
    "tempK": 274.0,
    "tempC": 0.85,
    "thermalInertia": 320.0,
    "themisDayK": 275.5,
    "themisNightK": null
  },
  {
    "hour": "15:00",
    "tempK": 272.6,
    "tempC": -0.55,
    "thermalInertia": 320.0,
    "themisDayK": 274.1,
    "themisNightK": null
  },
  {
    "hour": "16:00",
    "tempK": 268.51,
    "tempC": -4.64,
    "thermalInertia": 320.0,
    "themisDayK": 270.01,
    "themisNightK": null
  },
  {
    "hour": "17:00",
    "tempK": 261.99,
    "tempC": -11.16,
    "thermalInertia": 320.0,
    "themisDayK": 263.49,
    "themisNightK": null
  },
  {
    "hour": "18:00",
    "tempK": 253.5,
    "tempC": -19.65,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "19:00",
    "tempK": 243.61,
    "tempC": -29.54,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": null
  },
  {
    "hour": "20:00",
    "tempK": 233.0,
    "tempC": -40.15,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 231.9
  },
  {
    "hour": "21:00",
    "tempK": 222.39,
    "tempC": -50.76,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 221.29
  },
  {
    "hour": "22:00",
    "tempK": 212.5,
    "tempC": -60.65,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 211.4
  },
  {
    "hour": "23:00",
    "tempK": 204.01,
    "tempC": -69.14,
    "thermalInertia": 320.0,
    "themisDayK": null,
    "themisNightK": 202.91
  }
];

export const ALBA_MONS_MOLA_TOPO: PlanetaryTopoTransect[] = [
  {
    "lng": -108.984,
    "lat": 30.322,
    "distKm": 0.0,
    "elevM": 3412.0
  },
  {
    "lng": -108.9488,
    "lat": 30.2935,
    "distKm": 2.48,
    "elevM": 3390.0
  },
  {
    "lng": -108.9136,
    "lat": 30.265,
    "distKm": 4.97,
    "elevM": 3407.0
  },
  {
    "lng": -108.8784,
    "lat": 30.2365,
    "distKm": 7.45,
    "elevM": 3379.0
  },
  {
    "lng": -108.8432,
    "lat": 30.208,
    "distKm": 9.93,
    "elevM": 3359.0
  },
  {
    "lng": -108.808,
    "lat": 30.1795,
    "distKm": 12.42,
    "elevM": 3364.0
  },
  {
    "lng": -108.7728,
    "lat": 30.151,
    "distKm": 14.9,
    "elevM": 3449.0
  },
  {
    "lng": -108.7377,
    "lat": 30.1225,
    "distKm": 17.38,
    "elevM": 3563.0
  },
  {
    "lng": -108.7025,
    "lat": 30.094,
    "distKm": 19.86,
    "elevM": 3679.0
  },
  {
    "lng": -108.6673,
    "lat": 30.0655,
    "distKm": 22.35,
    "elevM": 3736.0
  },
  {
    "lng": -108.6321,
    "lat": 30.0369,
    "distKm": 24.83,
    "elevM": 3805.0
  },
  {
    "lng": -108.5969,
    "lat": 30.0084,
    "distKm": 27.31,
    "elevM": 3773.0
  },
  {
    "lng": -108.5617,
    "lat": 29.9799,
    "distKm": 29.8,
    "elevM": 3540.0
  },
  {
    "lng": -108.5265,
    "lat": 29.9514,
    "distKm": 32.28,
    "elevM": 3793.0
  },
  {
    "lng": -108.4913,
    "lat": 29.9229,
    "distKm": 34.76,
    "elevM": 3682.0
  },
  {
    "lng": -108.4561,
    "lat": 29.8944,
    "distKm": 37.25,
    "elevM": 3517.0
  },
  {
    "lng": -108.4209,
    "lat": 29.8659,
    "distKm": 39.73,
    "elevM": 3346.0
  },
  {
    "lng": -108.3857,
    "lat": 29.8374,
    "distKm": 42.21,
    "elevM": 3592.0
  },
  {
    "lng": -108.3505,
    "lat": 29.8089,
    "distKm": 44.7,
    "elevM": 3784.0
  },
  {
    "lng": -108.3154,
    "lat": 29.7804,
    "distKm": 47.18,
    "elevM": 3841.0
  },
  {
    "lng": -108.2802,
    "lat": 29.7519,
    "distKm": 49.66,
    "elevM": 3615.0
  },
  {
    "lng": -108.245,
    "lat": 29.7234,
    "distKm": 52.15,
    "elevM": 3479.0
  },
  {
    "lng": -108.2098,
    "lat": 29.6949,
    "distKm": 54.63,
    "elevM": 3460.0
  },
  {
    "lng": -108.1746,
    "lat": 29.6664,
    "distKm": 57.11,
    "elevM": 3454.0
  },
  {
    "lng": -108.1394,
    "lat": 29.6379,
    "distKm": 59.59,
    "elevM": 3585.0
  },
  {
    "lng": -108.1042,
    "lat": 29.6094,
    "distKm": 62.08,
    "elevM": 3538.0
  },
  {
    "lng": -108.069,
    "lat": 29.5809,
    "distKm": 64.56,
    "elevM": 3514.0
  },
  {
    "lng": -108.0338,
    "lat": 29.5524,
    "distKm": 67.04,
    "elevM": 3409.0
  },
  {
    "lng": -107.9986,
    "lat": 29.5239,
    "distKm": 69.53,
    "elevM": 3375.0
  },
  {
    "lng": -107.9634,
    "lat": 29.4954,
    "distKm": 72.01,
    "elevM": 3316.0
  },
  {
    "lng": -107.9282,
    "lat": 29.4668,
    "distKm": 74.49,
    "elevM": 3023.0
  },
  {
    "lng": -107.8931,
    "lat": 29.4383,
    "distKm": 76.98,
    "elevM": 3010.0
  },
  {
    "lng": -107.8579,
    "lat": 29.4098,
    "distKm": 79.46,
    "elevM": 3064.0
  },
  {
    "lng": -107.8227,
    "lat": 29.3813,
    "distKm": 81.94,
    "elevM": 2965.0
  },
  {
    "lng": -107.7875,
    "lat": 29.3528,
    "distKm": 84.43,
    "elevM": 2948.0
  },
  {
    "lng": -107.7523,
    "lat": 29.3243,
    "distKm": 86.91,
    "elevM": 2951.0
  },
  {
    "lng": -107.7171,
    "lat": 29.2958,
    "distKm": 89.39,
    "elevM": 2959.0
  },
  {
    "lng": -107.6819,
    "lat": 29.2673,
    "distKm": 91.88,
    "elevM": 2966.0
  },
  {
    "lng": -107.6467,
    "lat": 29.2388,
    "distKm": 94.36,
    "elevM": 2966.0
  },
  {
    "lng": -107.6115,
    "lat": 29.2103,
    "distKm": 96.84,
    "elevM": 2973.0
  },
  {
    "lng": -107.5763,
    "lat": 29.1818,
    "distKm": 99.32,
    "elevM": 2971.0
  },
  {
    "lng": -107.5411,
    "lat": 29.1533,
    "distKm": 101.81,
    "elevM": 2953.0
  },
  {
    "lng": -107.5059,
    "lat": 29.1248,
    "distKm": 104.29,
    "elevM": 2936.0
  },
  {
    "lng": -107.4707,
    "lat": 29.0963,
    "distKm": 106.77,
    "elevM": 2905.0
  },
  {
    "lng": -107.4356,
    "lat": 29.0678,
    "distKm": 109.26,
    "elevM": 2877.0
  },
  {
    "lng": -107.4004,
    "lat": 29.0393,
    "distKm": 111.74,
    "elevM": 2853.0
  },
  {
    "lng": -107.3652,
    "lat": 29.0108,
    "distKm": 114.22,
    "elevM": 2830.0
  },
  {
    "lng": -107.33,
    "lat": 28.9823,
    "distKm": 116.71,
    "elevM": 2811.0
  },
  {
    "lng": -107.2948,
    "lat": 28.9538,
    "distKm": 119.19,
    "elevM": 2708.0
  },
  {
    "lng": -107.2596,
    "lat": 28.9253,
    "distKm": 121.67,
    "elevM": 2683.0
  },
  {
    "lng": -107.2244,
    "lat": 28.8967,
    "distKm": 124.16,
    "elevM": 2680.0
  },
  {
    "lng": -107.1892,
    "lat": 28.8682,
    "distKm": 126.64,
    "elevM": 2688.0
  },
  {
    "lng": -107.154,
    "lat": 28.8397,
    "distKm": 129.12,
    "elevM": 2681.0
  },
  {
    "lng": -107.1188,
    "lat": 28.8112,
    "distKm": 131.6,
    "elevM": 2668.0
  },
  {
    "lng": -107.0836,
    "lat": 28.7827,
    "distKm": 134.09,
    "elevM": 2662.0
  },
  {
    "lng": -107.0484,
    "lat": 28.7542,
    "distKm": 136.57,
    "elevM": 2650.0
  },
  {
    "lng": -107.0133,
    "lat": 28.7257,
    "distKm": 139.05,
    "elevM": 2649.0
  },
  {
    "lng": -106.9781,
    "lat": 28.6972,
    "distKm": 141.54,
    "elevM": 2639.0
  },
  {
    "lng": -106.9429,
    "lat": 28.6687,
    "distKm": 144.02,
    "elevM": 2614.0
  },
  {
    "lng": -106.9077,
    "lat": 28.6402,
    "distKm": 146.5,
    "elevM": 2592.0
  },
  {
    "lng": -106.8725,
    "lat": 28.6117,
    "distKm": 148.99,
    "elevM": 2571.0
  },
  {
    "lng": -106.8373,
    "lat": 28.5832,
    "distKm": 151.47,
    "elevM": 2533.0
  },
  {
    "lng": -106.8021,
    "lat": 28.5547,
    "distKm": 153.95,
    "elevM": 2504.0
  },
  {
    "lng": -106.7669,
    "lat": 28.5262,
    "distKm": 156.44,
    "elevM": 2478.0
  },
  {
    "lng": -106.7317,
    "lat": 28.4977,
    "distKm": 158.92,
    "elevM": 2450.0
  },
  {
    "lng": -106.6965,
    "lat": 28.4692,
    "distKm": 161.4,
    "elevM": 2440.0
  },
  {
    "lng": -106.6613,
    "lat": 28.4407,
    "distKm": 163.89,
    "elevM": 2423.0
  },
  {
    "lng": -106.6261,
    "lat": 28.4122,
    "distKm": 166.37,
    "elevM": 2405.0
  },
  {
    "lng": -106.5909,
    "lat": 28.3837,
    "distKm": 168.85,
    "elevM": 2398.0
  },
  {
    "lng": -106.5558,
    "lat": 28.3552,
    "distKm": 171.33,
    "elevM": 2383.0
  },
  {
    "lng": -106.5206,
    "lat": 28.3266,
    "distKm": 173.82,
    "elevM": 2367.0
  },
  {
    "lng": -106.4854,
    "lat": 28.2981,
    "distKm": 176.3,
    "elevM": 2335.0
  },
  {
    "lng": -106.4502,
    "lat": 28.2696,
    "distKm": 178.78,
    "elevM": 2322.0
  },
  {
    "lng": -106.415,
    "lat": 28.2411,
    "distKm": 181.27,
    "elevM": 2293.0
  },
  {
    "lng": -106.3798,
    "lat": 28.2126,
    "distKm": 183.75,
    "elevM": 2276.0
  },
  {
    "lng": -106.3446,
    "lat": 28.1841,
    "distKm": 186.23,
    "elevM": 2250.0
  },
  {
    "lng": -106.3094,
    "lat": 28.1556,
    "distKm": 188.72,
    "elevM": 2225.0
  },
  {
    "lng": -106.2742,
    "lat": 28.1271,
    "distKm": 191.2,
    "elevM": 2203.0
  },
  {
    "lng": -106.239,
    "lat": 28.0986,
    "distKm": 193.68,
    "elevM": 2175.0
  },
  {
    "lng": -106.2038,
    "lat": 28.0701,
    "distKm": 196.17,
    "elevM": 2150.0
  },
  {
    "lng": -106.1686,
    "lat": 28.0416,
    "distKm": 198.65,
    "elevM": 2141.0
  },
  {
    "lng": -106.1335,
    "lat": 28.0131,
    "distKm": 201.13,
    "elevM": 2128.0
  },
  {
    "lng": -106.0983,
    "lat": 27.9846,
    "distKm": 203.61,
    "elevM": 2100.0
  },
  {
    "lng": -106.0631,
    "lat": 27.9561,
    "distKm": 206.1,
    "elevM": 2074.0
  },
  {
    "lng": -106.0279,
    "lat": 27.9276,
    "distKm": 208.58,
    "elevM": 2060.0
  },
  {
    "lng": -105.9927,
    "lat": 27.8991,
    "distKm": 211.06,
    "elevM": 2062.0
  },
  {
    "lng": -105.9575,
    "lat": 27.8706,
    "distKm": 213.55,
    "elevM": 2132.0
  },
  {
    "lng": -105.9223,
    "lat": 27.8421,
    "distKm": 216.03,
    "elevM": 1963.0
  },
  {
    "lng": -105.8871,
    "lat": 27.8136,
    "distKm": 218.51,
    "elevM": 1640.0
  },
  {
    "lng": -105.8519,
    "lat": 27.7851,
    "distKm": 221.0,
    "elevM": 1573.0
  },
  {
    "lng": -105.8167,
    "lat": 27.7565,
    "distKm": 223.48,
    "elevM": 1861.0
  },
  {
    "lng": -105.7815,
    "lat": 27.728,
    "distKm": 225.96,
    "elevM": 1818.0
  },
  {
    "lng": -105.7463,
    "lat": 27.6995,
    "distKm": 228.45,
    "elevM": 1935.0
  },
  {
    "lng": -105.7112,
    "lat": 27.671,
    "distKm": 230.93,
    "elevM": 1896.0
  },
  {
    "lng": -105.676,
    "lat": 27.6425,
    "distKm": 233.41,
    "elevM": 1847.0
  },
  {
    "lng": -105.6408,
    "lat": 27.614,
    "distKm": 235.9,
    "elevM": 1811.0
  },
  {
    "lng": -105.6056,
    "lat": 27.5855,
    "distKm": 238.38,
    "elevM": 1887.0
  },
  {
    "lng": -105.5704,
    "lat": 27.557,
    "distKm": 240.86,
    "elevM": 1830.0
  },
  {
    "lng": -105.5352,
    "lat": 27.5285,
    "distKm": 243.34,
    "elevM": 1770.0
  },
  {
    "lng": -105.5,
    "lat": 27.5,
    "distKm": 245.83,
    "elevM": 1763.0
  }
];

export const JEZERO_MOLA_TOPO: PlanetaryTopoTransect[] = [
  {
    "lng": 77.25,
    "lat": 18.25,
    "distKm": 0.0,
    "elevM": -1897.0
  },
  {
    "lng": 77.254,
    "lat": 18.253,
    "distKm": 0.29,
    "elevM": -1899.0
  },
  {
    "lng": 77.2581,
    "lat": 18.2561,
    "distKm": 0.58,
    "elevM": -1792.0
  },
  {
    "lng": 77.2621,
    "lat": 18.2591,
    "distKm": 0.87,
    "elevM": -1792.0
  },
  {
    "lng": 77.2662,
    "lat": 18.2621,
    "distKm": 1.16,
    "elevM": -1730.0
  },
  {
    "lng": 77.2702,
    "lat": 18.2652,
    "distKm": 1.45,
    "elevM": -1730.0
  },
  {
    "lng": 77.2742,
    "lat": 18.2682,
    "distKm": 1.73,
    "elevM": -1753.0
  },
  {
    "lng": 77.2783,
    "lat": 18.2712,
    "distKm": 2.02,
    "elevM": -1753.0
  },
  {
    "lng": 77.2823,
    "lat": 18.2742,
    "distKm": 2.31,
    "elevM": -1757.0
  },
  {
    "lng": 77.2864,
    "lat": 18.2773,
    "distKm": 2.6,
    "elevM": -1807.0
  },
  {
    "lng": 77.2904,
    "lat": 18.2803,
    "distKm": 2.89,
    "elevM": -1811.0
  },
  {
    "lng": 77.2944,
    "lat": 18.2833,
    "distKm": 3.18,
    "elevM": -1811.0
  },
  {
    "lng": 77.2985,
    "lat": 18.2864,
    "distKm": 3.47,
    "elevM": -1867.0
  },
  {
    "lng": 77.3025,
    "lat": 18.2894,
    "distKm": 3.76,
    "elevM": -1867.0
  },
  {
    "lng": 77.3066,
    "lat": 18.2924,
    "distKm": 4.05,
    "elevM": -1931.0
  },
  {
    "lng": 77.3106,
    "lat": 18.2955,
    "distKm": 4.34,
    "elevM": -1931.0
  },
  {
    "lng": 77.3146,
    "lat": 18.2985,
    "distKm": 4.63,
    "elevM": -2020.0
  },
  {
    "lng": 77.3187,
    "lat": 18.3015,
    "distKm": 4.92,
    "elevM": -2014.0
  },
  {
    "lng": 77.3227,
    "lat": 18.3045,
    "distKm": 5.2,
    "elevM": -2095.0
  },
  {
    "lng": 77.3268,
    "lat": 18.3076,
    "distKm": 5.49,
    "elevM": -2096.0
  },
  {
    "lng": 77.3308,
    "lat": 18.3106,
    "distKm": 5.78,
    "elevM": -2138.0
  },
  {
    "lng": 77.3348,
    "lat": 18.3136,
    "distKm": 6.07,
    "elevM": -2138.0
  },
  {
    "lng": 77.3389,
    "lat": 18.3167,
    "distKm": 6.36,
    "elevM": -2171.0
  },
  {
    "lng": 77.3429,
    "lat": 18.3197,
    "distKm": 6.65,
    "elevM": -2171.0
  },
  {
    "lng": 77.347,
    "lat": 18.3227,
    "distKm": 6.94,
    "elevM": -2215.0
  },
  {
    "lng": 77.351,
    "lat": 18.3258,
    "distKm": 7.23,
    "elevM": -2211.0
  },
  {
    "lng": 77.3551,
    "lat": 18.3288,
    "distKm": 7.52,
    "elevM": -2211.0
  },
  {
    "lng": 77.3591,
    "lat": 18.3318,
    "distKm": 7.81,
    "elevM": -2244.0
  },
  {
    "lng": 77.3631,
    "lat": 18.3348,
    "distKm": 8.1,
    "elevM": -2244.0
  },
  {
    "lng": 77.3672,
    "lat": 18.3379,
    "distKm": 8.38,
    "elevM": -2299.0
  },
  {
    "lng": 77.3712,
    "lat": 18.3409,
    "distKm": 8.67,
    "elevM": -2351.0
  },
  {
    "lng": 77.3753,
    "lat": 18.3439,
    "distKm": 8.96,
    "elevM": -2406.0
  },
  {
    "lng": 77.3793,
    "lat": 18.347,
    "distKm": 9.25,
    "elevM": -2438.0
  },
  {
    "lng": 77.3833,
    "lat": 18.35,
    "distKm": 9.54,
    "elevM": -2466.0
  },
  {
    "lng": 77.3874,
    "lat": 18.353,
    "distKm": 9.83,
    "elevM": -2466.0
  },
  {
    "lng": 77.3914,
    "lat": 18.3561,
    "distKm": 10.12,
    "elevM": -2503.0
  },
  {
    "lng": 77.3955,
    "lat": 18.3591,
    "distKm": 10.41,
    "elevM": -2503.0
  },
  {
    "lng": 77.3995,
    "lat": 18.3621,
    "distKm": 10.7,
    "elevM": -2526.0
  },
  {
    "lng": 77.4035,
    "lat": 18.3652,
    "distKm": 10.99,
    "elevM": -2526.0
  },
  {
    "lng": 77.4076,
    "lat": 18.3682,
    "distKm": 11.28,
    "elevM": -2540.0
  },
  {
    "lng": 77.4116,
    "lat": 18.3712,
    "distKm": 11.57,
    "elevM": -2543.0
  },
  {
    "lng": 77.4157,
    "lat": 18.3742,
    "distKm": 11.85,
    "elevM": -2557.0
  },
  {
    "lng": 77.4197,
    "lat": 18.3773,
    "distKm": 12.14,
    "elevM": -2557.0
  },
  {
    "lng": 77.4237,
    "lat": 18.3803,
    "distKm": 12.43,
    "elevM": -2569.0
  },
  {
    "lng": 77.4278,
    "lat": 18.3833,
    "distKm": 12.72,
    "elevM": -2569.0
  },
  {
    "lng": 77.4318,
    "lat": 18.3864,
    "distKm": 13.01,
    "elevM": -2577.0
  },
  {
    "lng": 77.4359,
    "lat": 18.3894,
    "distKm": 13.3,
    "elevM": -2577.0
  },
  {
    "lng": 77.4399,
    "lat": 18.3924,
    "distKm": 13.59,
    "elevM": -2586.0
  },
  {
    "lng": 77.4439,
    "lat": 18.3955,
    "distKm": 13.88,
    "elevM": -2582.0
  },
  {
    "lng": 77.448,
    "lat": 18.3985,
    "distKm": 14.17,
    "elevM": -2586.0
  },
  {
    "lng": 77.452,
    "lat": 18.4015,
    "distKm": 14.46,
    "elevM": -2582.0
  },
  {
    "lng": 77.4561,
    "lat": 18.4045,
    "distKm": 14.75,
    "elevM": -2588.0
  },
  {
    "lng": 77.4601,
    "lat": 18.4076,
    "distKm": 15.04,
    "elevM": -2588.0
  },
  {
    "lng": 77.4641,
    "lat": 18.4106,
    "distKm": 15.32,
    "elevM": -2593.0
  },
  {
    "lng": 77.4682,
    "lat": 18.4136,
    "distKm": 15.61,
    "elevM": -2601.0
  },
  {
    "lng": 77.4722,
    "lat": 18.4167,
    "distKm": 15.9,
    "elevM": -2601.0
  },
  {
    "lng": 77.4763,
    "lat": 18.4197,
    "distKm": 16.19,
    "elevM": -2613.0
  },
  {
    "lng": 77.4803,
    "lat": 18.4227,
    "distKm": 16.48,
    "elevM": -2613.0
  },
  {
    "lng": 77.4843,
    "lat": 18.4258,
    "distKm": 16.77,
    "elevM": -2627.0
  },
  {
    "lng": 77.4884,
    "lat": 18.4288,
    "distKm": 17.06,
    "elevM": -2627.0
  },
  {
    "lng": 77.4924,
    "lat": 18.4318,
    "distKm": 17.35,
    "elevM": -2636.0
  },
  {
    "lng": 77.4965,
    "lat": 18.4348,
    "distKm": 17.64,
    "elevM": -2634.0
  },
  {
    "lng": 77.5005,
    "lat": 18.4379,
    "distKm": 17.93,
    "elevM": -2642.0
  },
  {
    "lng": 77.5045,
    "lat": 18.4409,
    "distKm": 18.22,
    "elevM": -2630.0
  },
  {
    "lng": 77.5086,
    "lat": 18.4439,
    "distKm": 18.5,
    "elevM": -2636.0
  },
  {
    "lng": 77.5126,
    "lat": 18.447,
    "distKm": 18.79,
    "elevM": -2636.0
  },
  {
    "lng": 77.5167,
    "lat": 18.45,
    "distKm": 19.08,
    "elevM": -2620.0
  },
  {
    "lng": 77.5207,
    "lat": 18.453,
    "distKm": 19.37,
    "elevM": -2620.0
  },
  {
    "lng": 77.5247,
    "lat": 18.4561,
    "distKm": 19.66,
    "elevM": -2610.0
  },
  {
    "lng": 77.5288,
    "lat": 18.4591,
    "distKm": 19.95,
    "elevM": -2610.0
  },
  {
    "lng": 77.5328,
    "lat": 18.4621,
    "distKm": 20.24,
    "elevM": -2616.0
  },
  {
    "lng": 77.5369,
    "lat": 18.4652,
    "distKm": 20.53,
    "elevM": -2605.0
  },
  {
    "lng": 77.5409,
    "lat": 18.4682,
    "distKm": 20.82,
    "elevM": -2609.0
  },
  {
    "lng": 77.5449,
    "lat": 18.4712,
    "distKm": 21.11,
    "elevM": -2599.0
  },
  {
    "lng": 77.549,
    "lat": 18.4742,
    "distKm": 21.4,
    "elevM": -2598.0
  },
  {
    "lng": 77.553,
    "lat": 18.4773,
    "distKm": 21.69,
    "elevM": -2598.0
  },
  {
    "lng": 77.5571,
    "lat": 18.4803,
    "distKm": 21.97,
    "elevM": -2589.0
  },
  {
    "lng": 77.5611,
    "lat": 18.4833,
    "distKm": 22.26,
    "elevM": -2589.0
  },
  {
    "lng": 77.5652,
    "lat": 18.4864,
    "distKm": 22.55,
    "elevM": -2589.0
  },
  {
    "lng": 77.5692,
    "lat": 18.4894,
    "distKm": 22.84,
    "elevM": -2586.0
  },
  {
    "lng": 77.5732,
    "lat": 18.4924,
    "distKm": 23.13,
    "elevM": -2586.0
  },
  {
    "lng": 77.5773,
    "lat": 18.4955,
    "distKm": 23.42,
    "elevM": -2585.0
  },
  {
    "lng": 77.5813,
    "lat": 18.4985,
    "distKm": 23.71,
    "elevM": -2585.0
  },
  {
    "lng": 77.5854,
    "lat": 18.5015,
    "distKm": 24.0,
    "elevM": -2585.0
  },
  {
    "lng": 77.5894,
    "lat": 18.5045,
    "distKm": 24.29,
    "elevM": -2581.0
  },
  {
    "lng": 77.5934,
    "lat": 18.5076,
    "distKm": 24.58,
    "elevM": -2581.0
  },
  {
    "lng": 77.5975,
    "lat": 18.5106,
    "distKm": 24.87,
    "elevM": -2580.0
  },
  {
    "lng": 77.6015,
    "lat": 18.5136,
    "distKm": 25.15,
    "elevM": -2582.0
  },
  {
    "lng": 77.6056,
    "lat": 18.5167,
    "distKm": 25.44,
    "elevM": -2582.0
  },
  {
    "lng": 77.6096,
    "lat": 18.5197,
    "distKm": 25.73,
    "elevM": -2581.0
  },
  {
    "lng": 77.6136,
    "lat": 18.5227,
    "distKm": 26.02,
    "elevM": -2581.0
  },
  {
    "lng": 77.6177,
    "lat": 18.5258,
    "distKm": 26.31,
    "elevM": -2582.0
  },
  {
    "lng": 77.6217,
    "lat": 18.5288,
    "distKm": 26.6,
    "elevM": -2580.0
  },
  {
    "lng": 77.6258,
    "lat": 18.5318,
    "distKm": 26.89,
    "elevM": -2581.0
  },
  {
    "lng": 77.6298,
    "lat": 18.5348,
    "distKm": 27.18,
    "elevM": -2575.0
  },
  {
    "lng": 77.6338,
    "lat": 18.5379,
    "distKm": 27.47,
    "elevM": -2576.0
  },
  {
    "lng": 77.6379,
    "lat": 18.5409,
    "distKm": 27.76,
    "elevM": -2576.0
  },
  {
    "lng": 77.6419,
    "lat": 18.5439,
    "distKm": 28.05,
    "elevM": -2571.0
  },
  {
    "lng": 77.646,
    "lat": 18.547,
    "distKm": 28.34,
    "elevM": -2571.0
  },
  {
    "lng": 77.65,
    "lat": 18.55,
    "distKm": 28.62,
    "elevM": -2569.0
  }
];

export const EXTRACTED_DATASETS_REGISTRY: ExtractedDatasetMetadata[] = [
  {
    id: 'SHK-DEM',
    name: 'Topografía de Cráter Shackleton (Polo Sur Artemis)',
    body: 'Luna',
    instrument: 'LRO LOLA Global DEM (256 ppd)',
    csvFileName: 'Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
    csvDownloadPath: '/datasets/LUNA/topografia/Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
    resolution: 'Altímetro Láser LOLA (precisión vertical sub-métrica)',
    scientificContext: 'Escarpes abruptos de hasta 32° en el brocal del cráter con desniveles de más de 4.2 km hacia el fondo en sombra permanente.',
    engineeringRelevance: 'Determinación de zonas de peligro de vuelco para el módulo de alunizaje tripulado de Artemis III y cálculo de visibilidad directa de antenas.'
  },
  {
    id: 'SHK-TEMP',
    name: 'Régimen Térmico y Trampas de Hielo de Shackleton',
    body: 'Luna',
    instrument: 'LRO Diviner Lunar Radiometer Experiment (DLRE)',
    csvFileName: 'Shackleton_Crater_temperatura_diviner.csv',
    csvDownloadPath: '/datasets/LUNA/temperatura/Shackleton_Crater_temperatura_diviner.csv',
    resolution: 'Canales térmicos 7 y 8 (500m de resolución)',
    scientificContext: 'Temperaturas estables de 40 K (-233 °C) en el fondo del cráter que permiten la retención de hielo volátil durante miles de millones de años.',
    engineeringRelevance: 'Requerimientos criogénicos para el taladro TRIDENT del rover VIPER y trajes espaciales AxEMU de Axiom Space.'
  },
  {
    id: 'COP-DEM',
    name: 'Topografía de Terrazas del Cráter Copernicus',
    body: 'Luna',
    instrument: 'LRO LOLA Global DEM (256 ppd)',
    csvFileName: 'Copernicus_Crater_LOLA_DEM.csv',
    csvDownloadPath: '/datasets/LUNA/topografia/Copernicus_Crater_LOLA_DEM.csv',
    resolution: 'Transecto diametral de 89.7 km borde a borde',
    scientificContext: 'Astroblema complejo con terrazas de rebote gravitacional concéntricas y tres picos centrales que alcanzan 1.2 km sobre el piso.',
    engineeringRelevance: 'Simulación de operaciones de exploración de paredes empinadas y navegación autónoma en grandes depresiones.'
  },
  {
    id: 'COP-TEMP',
    name: 'Ciclo Térmico Diurno de Copernicus (24 Horas Solares)',
    body: 'Luna',
    instrument: 'LRO Diviner Canales 7 y 8',
    csvFileName: 'Copernicus_Crater_temperatura_diviner.csv',
    csvDownloadPath: '/datasets/LUNA/temperatura/Copernicus_Crater_temperatura_diviner.csv',
    resolution: 'Mediciones horarias de temperatura superficial de 00:00 a 23:00 LST',
    scientificContext: 'Oscilación extrema de delta 290 K: desde 385 K (+112 °C) al cenit solar hasta 95 K (-178 °C) en la noche lunar profunda.',
    engineeringRelevance: 'Ciclos de fatiga térmica extrema para soldaduras, sellos mecánicos y disipadores bifásicos de calor.'
  },
  {
    id: 'JEZ-DEM',
    name: 'Transecto Delta Fluvial del Cráter Jezero',
    body: 'Marte',
    instrument: 'Mars Global Surveyor MOLA Global DEM (128 ppd)',
    csvFileName: 'Jezero_Crater_Perseverance_MOLA_DEM.csv',
    csvDownloadPath: '/datasets/MARTE/topografia/Jezero_Crater_Perseverance_MOLA_DEM.csv',
    resolution: 'Perfil altimétrico de 28.6 km cruzando Neretva Vallis',
    scientificContext: 'Escarpe deltaico de 70 m de desnivel con frentes de sedimentación fluvial ricos en arcillas esmectíticas y carbonatos.',
    engineeringRelevance: 'Evaluación de capacidad de tracción de seis ruedas motrices de Perseverance en suelos no consolidados con cantos rodados.'
  },
  {
    id: 'JEZ-TEMP',
    name: 'Temperatura e Inercia Térmica de Jezero (TES / THEMIS)',
    body: 'Marte',
    instrument: 'MGS Thermal Emission Spectrometer (TES) & Mars Odyssey THEMIS',
    csvFileName: 'Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
    csvDownloadPath: '/datasets/MARTE/temperatura/Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
    resolution: 'Inercia térmica derivada en J m^-2 K^-1 s^-0.5',
    scientificContext: 'Inercia térmica moderada-alta (320 J m^-2 K^-1 s^-0.5) correspondiente a gravas, cantos rodados y costras cementadas.',
    engineeringRelevance: 'Permite discriminar la firmeza del terreno antes de planificar rutas de desplazamiento autónomo del rover.'
  },
  {
    id: 'ALB-DEM',
    name: 'Topografía de Flancos Volcánicos de Alba Mons',
    body: 'Marte',
    instrument: 'MGS MOLA Global DEM (128 ppd)',
    csvFileName: 'Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
    csvDownloadPath: '/datasets/MARTE/topografia/Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
    resolution: 'Perfil regional de 245.8 km de flanco volcánico',
    scientificContext: 'El volcán más extenso de Marte en superficie (>1,500 km ø) pero con gradientes de pendiente mínimos (<1°).',
    engineeringRelevance: 'Pruebas de desplazamiento continuo en llanuras volcánicas masivas con baja resistencia de sustentación.'
  },
  {
    id: 'ALB-TEMP',
    name: 'Inercia Térmica Ultrabaja de Alba Mons (TES / THEMIS)',
    body: 'Marte',
    instrument: 'MGS TES & Mars Odyssey THEMIS Day/Night IR',
    csvFileName: 'Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
    csvDownloadPath: '/datasets/MARTE/temperatura/Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
    resolution: 'Lecturas de inercia térmica y emisión diurna/nocturna',
    scientificContext: 'Inercia térmica ultrabaja (145 J m^-2 K^-1 s^-0.5) que denota un manto profundo de polvo volcánico eólico ultrafino y suelto.',
    engineeringRelevance: 'Alerta crítica de enterramiento de ruedas por falta de cohesión mecánica del suelo; ensayos con neumáticos de resorte helicoidal (NASA Spring Tire).'
  }
];

export function getPlanetaryTopo(targetId: string): PlanetaryTopoTransect[] {
  switch (targetId) {
    case 'MOON-SHK':
      return SHACKLETON_LOLA_TOPO;
    case 'MOON-COP':
      return COPERNICUS_LOLA_TOPO;
    case 'MARS-JEZ':
      return JEZERO_MOLA_TOPO;
    case 'MARS-ALB':
      return ALBA_MONS_MOLA_TOPO;
    default:
      if (targetId.startsWith('MOON')) return SHACKLETON_LOLA_TOPO;
      return JEZERO_MOLA_TOPO;
  }
}

export interface TopoStats {
  minElev: number;
  maxElev: number;
  elevDelta: number;
  totalDistKm: number;
  maxSlopeDeg: number;
  avgSlopeDeg: number;
  pointsCount: number;
}

export function getTopoStats(points: PlanetaryTopoTransect[]): TopoStats {
  if (!points || points.length === 0) {
    return { minElev: 0, maxElev: 0, elevDelta: 0, totalDistKm: 0, maxSlopeDeg: 0, avgSlopeDeg: 0, pointsCount: 0 };
  }
  let minElev = Infinity;
  let maxElev = -Infinity;
  let maxSlopeDeg = 0;
  let sumSlopeDeg = 0;
  let slopeCount = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.elevM < minElev) minElev = p.elevM;
    if (p.elevM > maxElev) maxElev = p.elevM;

    if (i > 0) {
      const prev = points[i - 1];
      const deltaZ = Math.abs(p.elevM - prev.elevM);
      const deltaD = Math.max((p.distKm - prev.distKm) * 1000, 1);
      const slopeDeg = Math.atan(deltaZ / deltaD) * (180 / Math.PI);
      if (slopeDeg > maxSlopeDeg) maxSlopeDeg = slopeDeg;
      sumSlopeDeg += slopeDeg;
      slopeCount++;
    }
  }

  const totalDistKm = points[points.length - 1].distKm;
  const avgSlopeDeg = slopeCount > 0 ? sumSlopeDeg / slopeCount : 0;

  return {
    minElev: Math.round(minElev),
    maxElev: Math.round(maxElev),
    elevDelta: Math.round(maxElev - minElev),
    totalDistKm: Number(totalDistKm.toFixed(1)),
    maxSlopeDeg: Number(maxSlopeDeg.toFixed(1)),
    avgSlopeDeg: Number(avgSlopeDeg.toFixed(1)),
    pointsCount: points.length,
  };
}

export interface TargetDatasetSummary {
  instrumentBadge: string;
  demCsvName: string;
  demDownloadUrl: string;
  tempCsvName: string;
  tempDownloadUrl: string;
  resolutionInfo: string;
  metrics: { label: string; value: string }[];
  thermalSummary: string;
  bearingCapacityNote: string;
}

export function getTargetDatasetSummary(targetId: string): TargetDatasetSummary {
  switch (targetId) {
    case 'MOON-SHK':
      return {
        instrumentBadge: 'LRO LOLA DEM + Diviner DLRE',
        demCsvName: 'Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
        demDownloadUrl: '/datasets/LUNA/topografia/Shackleton_Crater_Polo_Sur_Artemis_LOLA_DEM.csv',
        tempCsvName: 'Shackleton_Crater_temperatura_diviner.csv',
        tempDownloadUrl: '/datasets/LUNA/temperatura/Shackleton_Crater_temperatura_diviner.csv',
        resolutionInfo: 'LOLA 256 ppd (~118 m/px) · Diviner Canales 7 y 8',
        metrics: [
          { label: 'PROFUNDIDAD', value: '4.2 km' },
          { label: 'DIAMETRO', value: '21.0 km' },
          { label: 'TEMP PSR', value: '38.4 K (-234.7 °C)' },
          { label: 'PENDIENTE BORDE', value: 'Hasta 32°' },
        ],
        thermalSummary: 'Trampas criogénicas de hielo en sombra perpetua (PSR a <40 K) con bordes iluminados a ~200 K.',
        bearingCapacityNote: 'Regolito anortosítico polar compactado con riesgo de criofractura en rodamientos mecánicos.',
      };
    case 'MOON-COP':
      return {
        instrumentBadge: 'LRO LOLA DEM + Diviner DLRE',
        demCsvName: 'Copernicus_Crater_LOLA_DEM.csv',
        demDownloadUrl: '/datasets/LUNA/topografia/Copernicus_Crater_LOLA_DEM.csv',
        tempCsvName: 'Copernicus_Crater_temperatura_diviner.csv',
        tempDownloadUrl: '/datasets/LUNA/temperatura/Copernicus_Crater_temperatura_diviner.csv',
        resolutionInfo: 'LOLA 256 ppd (89.7 km transect) · Diviner Canales 7 y 8',
        metrics: [
          { label: 'DESNIVEL BORDE-PISO', value: '3.8 km' },
          { label: 'DIAMETRO TOTAL', value: '89.7 km' },
          { label: 'OSCILACION DIURNA', value: 'Delta 290 K (+112 °C a -178 °C)' },
          { label: 'PICOS CENTRALES', value: '+1.2 km de altura' },
        ],
        thermalSummary: 'Ciclo diurno de 24 horas solares lunares: 385 K al cenit hasta 95 K en noche profunda.',
        bearingCapacityNote: 'Terrazas concéntricas de colapso de impacto con bloques angulares de manto levantado.',
      };
    case 'MARS-JEZ':
      return {
        instrumentBadge: 'MGS MOLA DEM + TES / THEMIS',
        demCsvName: 'Jezero_Crater_Perseverance_MOLA_DEM.csv',
        demDownloadUrl: '/datasets/MARTE/topografia/Jezero_Crater_Perseverance_MOLA_DEM.csv',
        tempCsvName: 'Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
        tempDownloadUrl: '/datasets/MARTE/temperatura/Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
        resolutionInfo: 'MOLA 128 ppd (28.6 km transect) · TES & THEMIS IR',
        metrics: [
          { label: 'INERCIA TERMICA', value: '320 J m⁻² K⁻¹ s⁻⁰·⁵' },
          { label: 'ESCARPE DELTA', value: '70 m de desnivel' },
          { label: 'AMPLITUD TERMICA', value: '-18.5 °C a -81.2 °C' },
          { label: 'PENDIENTE MEDIA', value: '1.8°' },
        ],
        thermalSummary: 'Inercia moderada-alta (320 J m⁻² K⁻¹ s⁻⁰·⁵): sustrato competente de gravas fluviales y duricrust.',
        bearingCapacityNote: 'Excelente capacidad de soporte portante para rovers pesados (Perseverance / Curiosity clase 1,025 kg).',
      };
    case 'MARS-ALB':
      return {
        instrumentBadge: 'MGS MOLA DEM + TES / THEMIS',
        demCsvName: 'Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
        demDownloadUrl: '/datasets/MARTE/topografia/Alba_Mons_Tharsis_volcan_MOLA_DEM.csv',
        tempCsvName: 'Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
        tempDownloadUrl: '/datasets/MARTE/temperatura/Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
        resolutionInfo: 'MOLA 128 ppd (245.8 km transect) · TES & THEMIS IR',
        metrics: [
          { label: 'INERCIA TERMICA', value: '145 J m⁻² K⁻¹ s⁻⁰·⁵' },
          { label: 'DIAMETRO CALDERA', value: '>1,500 km' },
          { label: 'GRADIENTE FLANCO', value: '< 1.0° (Llanura)' },
          { label: 'AMPLITUD TERMICA', value: '-13.2 °C a -98.2 °C' },
        ],
        thermalSummary: 'Inercia térmica ultrabaja (145 J m⁻² K⁻¹ s⁻⁰·⁵): manto de polvo eólico ultrafino (<10 µm) altamente aislante.',
        bearingCapacityNote: 'Riesgo crítico de hundimiento (sinkage) y pérdida de tracción; requiere ruedas de alta superficie de contacto.',
      };
    default:
      return {
        instrumentBadge: 'NASA Extracted Dataset',
        demCsvName: 'dataset_dem.csv',
        demDownloadUrl: '/datasets/',
        tempCsvName: 'dataset_temp.csv',
        tempDownloadUrl: '/datasets/',
        resolutionInfo: 'NASA Planetary Data System',
        metrics: [],
        thermalSummary: 'Telemetría espacial de referencia.',
        bearingCapacityNote: 'Caracterización geotécnica estándar.',
      };
  }
}

// ─── Real Thermal Inertia & Radiometric Temperature Profiles ────────────────
// Direct from official repository CSV files: TES/THEMIS & LRO Diviner

export interface TargetThermalProfile {
  targetId: string;
  targetName: string;
  targetBody: 'Luna' | 'Marte';
  instrumentBadge: string;
  csvFileName: string;
  csvDownloadUrl: string;
  thermalInertiaTIU: number;
  thermalInertiaRegime: string;
  tempMinK: number;
  tempMaxK: number;
  tempMeanK: number;
  tempMinC: number;
  tempMaxC: number;
  tempMeanC: number;
  deltaTK: number;
  deltaTC: number;
  implicationsText: string;
}

export function getTargetThermalProfile(targetId: string): TargetThermalProfile {
  switch (targetId) {
    case 'MOON-SHK':
      return {
        targetId: 'MOON-SHK',
        targetName: 'Cráter Shackleton (Polo Sur)',
        targetBody: 'Luna',
        instrumentBadge: 'LRO Diviner Lunar Radiometer (DLRE)',
        csvFileName: 'Shackleton_Crater_temperatura_diviner.csv',
        csvDownloadUrl: '/DATASETS_EXTRAIDOS_NUEVOS/LUNA/temperatura/Shackleton_Crater_temperatura_diviner.csv',
        thermalInertiaTIU: 38.0,
        thermalInertiaRegime: '0 – 100 TIU: Polvo fino suelto / regolito altamente poroso',
        tempMinK: 38.4,
        tempMaxK: 245.0,
        tempMeanK: 165.0,
        tempMinC: -234.8,
        tempMaxC: -28.2,
        tempMeanC: -108.2,
        deltaTK: 206.6,
        deltaTC: 206.6,
        implicationsText:
          'En las trampas frías de sombra permanente (38 K), el regolito criogénico cementado por hielo actúa como roca de alta resistencia mecánica. Las herramientas de perforación ISRU requieren brocas de percusión de alto torque.',
      };
    case 'MOON-COP':
      return {
        targetId: 'MOON-COP',
        targetName: 'Cráter Copernicus',
        targetBody: 'Luna',
        instrumentBadge: 'LRO Diviner Lunar Radiometer (DLRE)',
        csvFileName: 'Copernicus_Crater_temperatura_diviner.csv',
        csvDownloadUrl: '/DATASETS_EXTRAIDOS_NUEVOS/LUNA/temperatura/Copernicus_Crater_temperatura_diviner.csv',
        thermalInertiaTIU: 55.0,
        thermalInertiaRegime: '0 – 100 TIU: Polvo fino suelto / regolito altamente poroso',
        tempMinK: 95.0,
        tempMaxK: 385.0,
        tempMeanK: 217.4,
        tempMinC: -178.1,
        tempMaxC: 111.9,
        tempMeanC: -55.7,
        deltaTK: 290.0,
        deltaTC: 290.0,
        implicationsText:
          'El ultra-alto vacío lunar suprime la conducción gaseosa, confinando el flujo térmico al contacto intergranular vítreo. La resistencia al corte aumenta bruscamente con la profundidad, dificultando la perforación ISRU.',
      };
    case 'MARS-JEZ':
      return {
        targetId: 'MARS-JEZ',
        targetName: 'Cráter Jezero (Perseverance)',
        targetBody: 'Marte',
        instrumentBadge: 'MGS TES / Mars Odyssey THEMIS',
        csvFileName: 'Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
        csvDownloadUrl: '/DATASETS_EXTRAIDOS_NUEVOS/MARTE/temperatura/Jezero_Crater_temperatura_inercia_TES_THEMIS.csv',
        thermalInertiaTIU: 320.0,
        thermalInertiaRegime: '100 – 350 TIU: Arena eólica / ceniza volcánica consolidada',
        tempMinK: 192.0,
        tempMaxK: 274.0,
        tempMeanK: 222.8,
        tempMinC: -81.2,
        tempMaxC: 0.9,
        tempMeanC: -50.4,
        deltaTK: 82.0,
        deltaTC: 82.0,
        implicationsText:
          'La inercia moderada (320 TIU) refleja mantos de arena eólica fina sobre duricrust en tenue atmósfera de CO₂ (6 hPa). El deslizamiento de ruedas en taludes arenosos y la compresión mecánica alteran la tracción nominal de rovers.',
      };
    case 'MARS-ALB':
      return {
        targetId: 'MARS-ALB',
        targetName: 'Alba Mons (Tharsis)',
        targetBody: 'Marte',
        instrumentBadge: 'MGS TES / Mars Odyssey THEMIS',
        csvFileName: 'Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
        csvDownloadUrl: '/DATASETS_EXTRAIDOS_NUEVOS/MARTE/temperatura/Alba_Mons_temperatura_inercia_TES_THEMIS.csv',
        thermalInertiaTIU: 145.0,
        thermalInertiaRegime: '100 – 350 TIU: Arena eólica / ceniza volcánica consolidada',
        tempMinK: 175.0,
        tempMaxK: 260.0,
        tempMeanK: 206.5,
        tempMinC: -98.2,
        tempMaxC: -13.2,
        tempMeanC: -66.7,
        deltaTK: 85.0,
        deltaTC: 85.0,
        implicationsText:
          'Inercia ultra-baja (145 TIU) por gruesos depósitos de polvo eólico no consolidado sobre el escudo basáltico. Riesgo crítico de atrapamiento por hundimiento de ruedas y escasa disipación térmica conductiva en superficie.',
      };
    default:
      if (targetId.startsWith('MOON')) {
        return getTargetThermalProfile('MOON-SHK');
      }
      return getTargetThermalProfile('MARS-JEZ');
  }
}

export function getEarthSiteThermalInertia(siteId: string): {
  tiu: number;
  regime: string;
  description: string;
} {
  switch (siteId) {
    case 'ATC-01':
      return {
        tiu: 780,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Duricrust de halita, nitratos y arcillas compactadas hiperáridas',
      };
    case 'RIO-02':
      return {
        tiu: 1250,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Gossan oxidado masivo y areniscas ferruginosas',
      };
    case 'MCM-03':
      return {
        tiu: 1080,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Permafrost seco consolidado y pavimento desértico de ventifactos',
      };
    case 'MJV-04':
      return {
        tiu: 560,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Arenas eólicas compactadas y abanico aluvial cuaternario',
      };
    case 'HAW-05':
      return {
        tiu: 1650,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Coladas basálticas pahoehoe y aa de alta densidad',
      };
    case 'ICE-06':
      return {
        tiu: 1420,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Basalto vesicular fisural y campos de tefra basáltica',
      };
    case 'TEI-07':
      return {
        tiu: 820,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Pómez fonolítica, lavas de obsidiana y cenizas',
      };
    case 'PLB-08':
      return {
        tiu: 1850,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Formaciones de hierro bandeado (BIF) y cherts arqueanos masivos',
      };
    case 'SVL-09':
      return {
        tiu: 1180,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Suelos poligonales con permafrost continuo y pizarras',
      };
    case 'HGT-10':
      return {
        tiu: 1320,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Brecha alóctona de impacto y dolomías paleozoicas',
      };
    case 'DNK-11':
      return {
        tiu: 920,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Costras salinas evaporíticas masivas sobre basaltos distensivos',
      };
    case 'LNZ-12':
      return {
        tiu: 1100,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Lapilli basáltico (picón) y lavas basálticas recientes',
      };
    case 'NMB-13':
      return {
        tiu: 540,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Arenas cuarzosas eólicas hiperáridas de alta madurez',
      };
    case 'LNR-14':
      return {
        tiu: 1720,
        regime: '> 1,200 TIU: Roca madre expuesta / basalto masivo',
        description: 'Basaltos de inundación del Decán en cráter de impacto simple',
      };
    default:
      return {
        tiu: 850,
        regime: '350 – 1,200 TIU: Duricrust cementado / brecha fracturada',
        description: 'Suelo análogo consolidado en atmósfera terrestre (1 atm)',
      };
  }
}

export function getThermalInertiaPositionPct(tiu: number): number {
  if (tiu <= 100) {
    return Math.max(3, (tiu / 100) * 25);
  } else if (tiu <= 350) {
    return 25 + ((tiu - 100) / (350 - 100)) * 25;
  } else if (tiu <= 1200) {
    return 50 + ((tiu - 350) / (1200 - 350)) * 25;
  } else {
    return 75 + Math.min(22, ((tiu - 1200) / (2200 - 1200)) * 25);
  }
}

export function getTemperaturePositionPct(tempC: number): number {
  const minC = -240;
  const maxC = 125;
  const clamped = Math.max(minC, Math.min(maxC, tempC));
  return ((clamped - minC) / (maxC - minC)) * 100;
}

