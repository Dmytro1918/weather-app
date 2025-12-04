'use client';
import {  useEffect, useState } from 'react';
import { getHourlyForecast } from '@/app/services/weatherService'; 
import { HourlyForecast } from '@/app/components/hourlyForecast/HourlyForecast';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import styles from "@/app/styles/components/cityStyles.module.scss"
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullScreenLoader from '@/app/components/screenLoader/ScreenLoader'; 

interface CityDetailsState {
    currentWeather?: any | null;
    city?: string;
    hourlyForecast: any[] | null;
    isLoading: boolean;
    error: string | null;
}


export default function CityDetailPage() {
    const searchParams = useSearchParams();
    const params = useParams()
    const lat = searchParams.get('lat'); 
    const lon = searchParams.get('lon'); 

    const [cityData, setCityData] = useState<CityDetailsState>({
        currentWeather: null,
        city: "",
        hourlyForecast: null,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        const fetchDetails = async () => {
            setCityData(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                let currentWeatherData = null;
                let hourlyForecast = null
                if (lat && lon) {

                     hourlyForecast = await getHourlyForecast(lat, lon);
                    if (hourlyForecast && hourlyForecast.current) {
                        currentWeatherData = hourlyForecast.current; 
                    }
                }
                setCityData({
                    currentWeather: currentWeatherData,
                    city: hourlyForecast.city.name,
                    hourlyForecast:  hourlyForecast.list, 
                    isLoading: false,
                    error: null
                });
                
            } catch (err) {
                console.error("Issue while loading detail data:", err);
                setCityData({
                    currentWeather: null,
                    hourlyForecast: [],
                    isLoading: false,
                    error: (err as Error).message || "Sorry, unknown issue occurred",
                });
            }
        };

        fetchDetails();
    }, [lat,lon]); 

    if (cityData.isLoading) {
        return <FullScreenLoader message="Please wait, we are processing this request for you" />;
    }
    if (cityData.isLoading) {
        return <div className="loading-state">Loading detail for {params.cityName}...</div>;
    }

    if (cityData.error) {
        return <div className="error-state">Error while loading: {cityData.error}</div>;
    }

    return (
        <div className={styles.mainPageContainer}>

            {cityData.hourlyForecast && cityData.hourlyForecast.length > 0 ? (
                <>
                    <div className={styles.headerWrapper}>
                        <Link href="/" className={styles.homePageLink}>
                            <Button variant="outlined" className={styles.headerButton}>
                                <div className={styles.buttonContent}> 
                                    <span className={styles.iconWrapper}>⏪</span>
                                    <span className={styles.buttonText}>
                                        Go back 
                                    </span>
                            </div>
                            </Button>
                        </Link>
                        <section className={styles.container}>
                            <h2 className={styles.cityName}> Hourly weather today for {cityData.city}</h2>
                        </section>
                    </div>
                    <HourlyForecast hourlyData={cityData.hourlyForecast} />
                </>
            ) : (
                <p>Hourly weather is not loaded || Issue with request</p>
            )}

        </div>
    );
}