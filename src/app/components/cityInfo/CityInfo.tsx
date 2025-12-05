'use client'; 
import React, { useState, useEffect, useCallback  } from 'react';
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { getCurrentWeather } from '../../services/weatherService'; 
import { AddCityForm } from '../addCityForm/AddCityForm';
import { CityCard } from '../cityCard/CityCard';
import styles from '@/app/styles/components/cityInfo.module.scss'
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface WeatherData {
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

export const CityInfo: React.FC = () => {
    const [cities, setCities] = useLocalStorage<CityState[]>('weather-cities', []);
    const [isMounted, setIsMounted] = useState(false);
    const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
        open: false,
        message: '',
        severity: 'error',
    });

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    //request +  parse of response
    const fetchWeatherForCity = useCallback(async (city: CityState): Promise<CityState> => {
        try {
            const weatherData = await getCurrentWeather(city.name);
            if (!weatherData) {
                return { ...city, isLoading: false, error: 'The city is not found or API error.', lastUpdated: Date.now() };
            }
            return {
                ...city,
                data: weatherData, 
                lastUpdated: Date.now(),
                isLoading: false,
                error: null,
            };
        } catch (e) {
            console.error(e);
            return { ...city, isLoading: false, error: (e as Error).message, lastUpdated: Date.now() };
        }
    }, []); 

    //refreshing all the cities weather
    const refreshAllWeather = useCallback(async () => {
        setIsGlobalRefreshing(true)
        setCities(prev => prev.map(c => ({ ...c, isLoading: true })));
        const updatedCitiesPromises = cities.map(fetchWeatherForCity);
        const updatedCities = await Promise.all(updatedCitiesPromises);
        setCities(updatedCities);
        setIsGlobalRefreshing(false);
    }, [cities,fetchWeatherForCity]);

    const handleCityRefresh = async (cityToUpdate: CityState) => {
        setCities(prev => prev.map(c => 
            c.id === cityToUpdate.id ? { ...c, isLoading: true } : c
        ));
        const updatedCity = await fetchWeatherForCity(cityToUpdate);        
        setCities(prev => prev.map(c =>
            c.id === cityToUpdate.id ? updatedCity : c
        ));
    };

    const removeCity = (cityId: string) => {
        setCities(prev => prev.filter(city => city.id !== cityId));
    };

    const addCity = useCallback(async (cityName: string) => {
        const normalizedCityName = cityName.trim().toLowerCase();
        if (cities.some(c => c.id === normalizedCityName)) {
            setSnackbar({
                open: true,
                message: `City "${cityName}" already exists.`,
                severity: 'error',
            });
            return;
        }
        const newCity: CityState = {
            id: normalizedCityName,
            name: cityName,
            lastUpdated: Date.now(),
            isLoading: false,
            error: null,
            coord: null
        };
        const cityWithWeatherData = await fetchWeatherForCity(newCity); 
        if (cityWithWeatherData.error) {
            setCities(prev => prev.filter(c => c.id !== normalizedCityName));
            setSnackbar({
                open: true,
                message: `Sorry, city "${cityName}" was not found. Please try again.`,
                severity: 'error',
            });
            return; 
        }
        setSnackbar({
            open: true,
            message: `City "${cityName}" added successfully!`,
            severity: 'success',
        });
        setCities(prev => [...prev, newCity]);

        setCities(prev => prev.map(c => 
            c.id === newCity.id ? cityWithWeatherData : c
        ));

    }, [cities]); 

    useEffect(() => {
        setIsMounted(true);
    }, []);

    //updating each city after page refresh
    useEffect(() => {
        if (isMounted && cities.length > 0) {
            refreshAllWeather();
        }
    }, [isMounted]);

    return (
        <div className={styles.cityDashboard}>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={2000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <header className={styles.dashboardHeader}>
                <h2 className={styles.title} >Weather Dashboard</h2>
                <Button variant="outlined" size="medium" onClick={refreshAllWeather} disabled={isGlobalRefreshing}>
                    {isGlobalRefreshing ? 'Updating...' : 'Update all 🔃'}
                </Button>
            </header>
            <AddCityForm onAddCity={addCity}></AddCityForm>
            <section className={styles.cityList}>
                {cities.map((city: CityState) => (
                    <CityCard 
                        key={city.id} 
                        city={city} 
                        onRefresh={() => handleCityRefresh(city)} 
                        onRemove={() => removeCity(city.id)}
                    />
                ))}
            </section>
        </div>
    );
}

