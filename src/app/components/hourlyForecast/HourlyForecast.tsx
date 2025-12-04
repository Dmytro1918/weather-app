'use client';
import React, { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import styles from "@/app/styles/components/hourlyForecast.module.scss";
import { Button } from "@mui/material";

const CHART_COLORS = {
    temp: { stroke: "#1976d2" }, 
    feels: { stroke: "#f50057"}, 
    wind: { stroke: "#ffc107"}, 
    humidity: { stroke: "#9c27b0"}, 
    pressure: { stroke: "#00bcd4"}, 
};

const getDayWithSuffix = (day: number): string => {
    if (day > 3 && day < 21) return day + 'th';
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
    }
};

const formatEnglishDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    
    return `${getDayWithSuffix(day)} of ${month}`;
};

const getSimpleDayName = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });

    return `${month} ${getDayWithSuffix(day)}`;
};


interface HourlyForecastProps {
    hourlyData: any[]; 
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData }) => {
    if (!hourlyData || hourlyData.length === 0) {
        return <p>No hourly forecast data...</p>;
    }
    
    const preparedData = hourlyData.map((h) => ({
        date: formatEnglishDate(h.dt), 
        simpleDate: getSimpleDayName(h.dt),
        timestamp: h.dt,
        time: new Date(h.dt * 1000).getHours() + ":00",
        temp: Math.round(h.main.temp - 273.15),
        feels: Math.round(h.main.feels_like - 273.15),
        wind: h.wind.speed,
        humidity: h.main.humidity,
        pressure: h.main.pressure,
        icon: h.weather[0].icon,
        description: h.weather[0].description
    }));

    const groupedByDay = useMemo(() => {
        const groups = new Map<string, typeof preparedData>();
        preparedData.forEach(item => {
            const dayKey = item.date;
            if (!groups.has(dayKey)) {
                groups.set(dayKey, []);
            }
            groups.get(dayKey)?.push(item);
        });
        return Array.from(groups.values());
    }, [preparedData]);
    
    const allAvailableDays = groupedByDay.length;
    
    const [daysToShow, setDaysToShow] = useState(1);
    const visibleData = groupedByDay.slice(0, daysToShow).flat();
    const chartData = visibleData;
    const handleLoadMore = () => {
        setDaysToShow(prev => prev + 1);
    };
    const isLoadMoreVisible = daysToShow < allAvailableDays;

    const renderChart = (dataKey: string, label: string,colorKey: keyof typeof CHART_COLORS) => {
        const colors = CHART_COLORS[colorKey];
        return (
            <div className={styles.chartBox}>
                <h3 className={styles.labelForGraph}>{label}</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={colors.stroke} 
                            strokeWidth={3}
                            dot={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    };


    const renderHourlyItems = () => {
        return groupedByDay.slice(0, daysToShow).map((dayGroup, dayIndex) => {
            
            const dateString = dayGroup[0].date; 

            return (
                <div key={dayIndex} className={styles.dailyRowWrapper}>                   
                    <h3 className={styles.dailyHeader}>
                        {dateString}
                    </h3>
                    <div className={styles.hourlyGridContainer}>                       
                        {dayGroup.map((h, itemIndex) => (
                            <div key={itemIndex} className={styles.threeHourItem}>                             
                                <div className={styles.timeWrapper}>
                                    <div className={styles.time}>{h.time}</div>
                                    <div className={styles.dateSmall}>{h.date}</div> 
                                </div>
                                
                                <img
                                    src={`https://openweathermap.org/img/wn/${h.icon}@2x.png`}
                                    alt={h.description}
                                    className={styles.icon}
                                />
                                <div className={styles.temp}>{h.temp}°C</div>
                                <div className={styles.description}>{h.description}</div>

                                <div className={styles.details}>
                                    <span>💨 {h.wind} m/s</span>
                                    <span>💧 {h.humidity}%</span>
                                    <span>📈 {h.pressure} hPa</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={styles.wrapper}>

            <div className={styles.chartsGrid}>
                {renderChart("temp", "Temperature (°C)", "temp")} 
                {renderChart("feels", "Feels Like (°C)", "feels")}
                {renderChart("wind", "Wind speed (m/s)", "wind")}
                {renderChart("humidity", "Humidity (%)", "humidity")}
            </div>

            <h2 className={styles.titleWeather}>Weather every 3 hours</h2>
            
            <div className={styles.threeHourList}>
                {renderHourlyItems()}
            </div>

            {isLoadMoreVisible && (
                <div className={styles.loadMoreButtonDiv}>
                    <Button 
                        variant="outlined" 
                        size="medium"
                        onClick={handleLoadMore} 
                    >
                        Load more for the next day ({getSimpleDayName(groupedByDay[daysToShow][0].timestamp)})
                    </Button>
                </div>
            )}

        </div>
    );
};