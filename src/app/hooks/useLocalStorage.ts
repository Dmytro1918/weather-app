'use client'
import { useState, useEffect, useMemo } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
    
    const [value, setValue] = useState<T>(() => {

        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const storedValue = window.localStorage.getItem(key);            
            if (storedValue) {
                return JSON.parse(storedValue) as T;
            }
        } catch (error) {
            console.error(`Key in local storage was not found "${key}":`, error);
        }
        
        return initialValue;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        
        try {
            const stringifiedValue = JSON.stringify(value);
            window.localStorage.setItem(key, stringifiedValue);
        } catch (error) {
            console.error(`Key setting in Local Storage issue  "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue] as const;
}

export default useLocalStorage;
