import { ParamValue } from "next/dist/server/request/params";
import { Ruluko } from "next/font/google";

const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function getCurrentWeather (city: string) {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if(!apiKey){
        console.log('ApiKey was not found', apiKey)
        return null
    }

    const url = `${BASE_URL}/weather?q=${city}&appid=${apiKey}&units=metric&lang=ua`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message || 'City not found or API error.'}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`An issue occurred while requesting the city ${city}:`, error);
        return null;
    }
}

export async function getHourlyForecast(lat: ParamValue, lon: ParamValue) {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
    if (!apiKey) {
        console.error("API_KEY not found");
        return null;
    }

    try {
        const response = await fetch(URL);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message || 'Error fetching hourly forecast.'}`);
        }

        const data = await response.json();
        return data; 

    } catch (error) {
        console.error(`Issue while getting weather for lat ${lat} and lon ${lon}:`, error);
        return null;
    }
}