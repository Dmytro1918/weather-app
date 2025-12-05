
export interface AddCityFormProps {
    onAddCity: (cityName: string) => Promise<void>;
}

export interface CityCardProps {
    city: CityState;
    onRefresh: () => void;
    onRemove: () => void;
}

export interface WeatherData {
    lat: number;
    lon: number;
    coord: {lat:number, lon:number};
    id: number;
    name: string;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    weather: Array<{
        main: any;
        description: string;
        icon: string;
    }>;
    sys: {
        country: string;
    };
}

export interface CityState {
    id: string; 
    name: string; 
    data?: WeatherData; 
    lastUpdated: number; 
    isLoading: boolean; 
    error: string | null;
    coord: {lat:number, lon:number} | null;
}

export interface FullScreenLoaderProps {
  message: string;
}

export interface HourlyForecastProps {
    hourlyData: any[]; 
}

export interface CityDetailsState {
    currentWeather?: any | null;
    city?: string;
    hourlyForecast: any[] | null;
    isLoading: boolean;
    error: string | null;
}