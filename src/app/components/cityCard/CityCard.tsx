import React from 'react';
import Link from 'next/link';
import styles from '@/app/styles/components/cityCard.module.scss'; 
import { CityCardProps } from '@/app/types/weather';

export const CityCard: React.FC<CityCardProps> = ({ city, onRefresh, onRemove }) => {
    const weatherData = city.data;
    const temperature = weatherData ? Math.round(weatherData.main.temp) : '—';
    const description = weatherData ? weatherData.weather[0].main : 'There is no data';
    const lastUpdate = city.lastUpdated 
        ? new Date(city.lastUpdated).toLocaleTimeString('uk-UA') 
        : 'Never';

    let detailUrl = `/cities/${city.id}`;     
    if (weatherData && weatherData.coord){
        detailUrl += `?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`;
    }
    const iconCode = weatherData ? weatherData.weather[0].icon : null;
    const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : null;

    return (
        <div className={styles.cardContainer}>
            <Link href={detailUrl}>
                <span className={styles.cityCard}>
                    <div className={styles.header}>
                        <h3 className={styles.cityName}>{city.name}</h3>
                        <p className={styles.country}>
                            {weatherData ? weatherData.sys.country : '—'}
                        </p>
                    </div>
                    <div className={styles.weatherInfo}>
                        {city.isLoading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : city.error ? (
                            <p className={styles.error}>{city.error}</p>
                        ) : (
                            <>
                                <div className={styles.tempSection}>
                                    <span className={styles.temperature}>{temperature}°C</span>
                                    {iconUrl && 
                                        <img src={iconUrl} alt={description} className={styles.weatherIcon} />
                                    }
                                </div>
                                <p className={styles.description}>{description}</p>
                                <p className={styles.lastUpdated}>Updated: {lastUpdate}</p>
                            </>
                        )}
                    </div>
                </span>
            </Link>

            <div className={styles.actions}>
                <button 
                    onClick={onRefresh} 
                    disabled={city.isLoading}
                    className={styles.refreshButton}
                >
                    {city.isLoading ? '...' : 'Update'}
                </button>
                <button 
                    onClick={onRemove} 
                    className={styles.removeButton}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};