import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CityInfo, CityState } from './CityInfo'; 
import '@testing-library/jest-dom';

const mockGetCurrentWeather = jest.fn();
jest.mock('../../services/weatherService', () => ({
    getCurrentWeather: mockGetCurrentWeather,
}));

const mockSetCities = jest.fn();
const mockCitiesState = [];
let localStorageData: CityState[] = [];
jest.mock('@/app/hooks/useLocalStorage', () => (key: string, initialValue: CityState[]) => {
    if (key === 'weather-cities') {
        return [localStorageData, mockSetCities];
    }
    return [initialValue, jest.fn()];
});

jest.mock('../addCityForm/AddCityForm', () => ({
    AddCityForm: ({ onAddCity }: { onAddCity: (city: string) => Promise<void> }) => (
        <button 
            data-testid="add-form-mock" 
            onClick={() => onAddCity("NewYork")}
        >
            Add City Mock
        </button>
    ),
}));

jest.mock('../cityCard/CityCard', () => ({
    CityCard: ({ city, onRemove, onRefresh }: { city: CityState, onRemove: () => void, onRefresh: () => void }) => (
        <div data-testid={`city-card-${city.id}`}>
            <h3>{city.name}</h3>
            <button onClick={onRefresh} data-testid={`refresh-${city.id}`}>Refresh</button>
            <button onClick={onRemove} data-testid={`remove-${city.id}`}>Remove</button>
        </div>
    ),
}));

const successWeatherData = {
    id: 123,
    name: 'New York',
    coord: { lat: 40, lon: -74 },
    main: { temp: 280, feels_like: 278, humidity: 50 },
    weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    sys: { country: 'US' },
    lat: 40,
    lon: -74,
};

describe('CityInfo Core Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageData = [];
        mockGetCurrentWeather.mockResolvedValue(successWeatherData)
        mockSetCities.mockImplementation((update) => {
            if (typeof update === 'function') {
                localStorageData = update(localStorageData);
            } else {
                localStorageData = update;
            }
        });
        jest.spyOn(React, 'useId').mockImplementation(() => 'test-id');
    });

    test('renders dashboard header and form when no cities are stored', () => {
        render(<CityInfo />);
        
        expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Add City Mock')).toBeInTheDocument();
        expect(screen.queryByTestId(/city-card-/)).not.toBeInTheDocument();
    });

    test('addCity handler successfully adds a new city and fetches weather data', async () => {
        render(<CityInfo />);
        
        fireEvent.click(screen.getByTestId('add-form-mock'));
        
        await waitFor(() => {
            expect(mockSetCities).toHaveBeenCalled();
        });

        expect(mockGetCurrentWeather).toHaveBeenCalledWith('NewYork');

        await waitFor(() => {
            expect(mockSetCities).toHaveBeenCalledTimes(2); 
            expect(localStorageData.length).toBe(1);
            expect(localStorageData[0].name).toBe('NewYork');
            expect(localStorageData[0].data).toBeDefined();
            expect(localStorageData[0].error).toBeNull();
        });
    });
    
    test('removeCity handler successfully removes a city from the list', () => {
        localStorageData = [createMockCity({ id: 'kyiv', name: 'Kyiv' })];
        render(<CityInfo />);
        expect(screen.getByText('Kyiv')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('remove'));
        expect(mockSetCities).toHaveBeenCalled();
        expect(localStorageData.length).toBe(0); 
    });
    
    function createMockCity(updates: Partial<CityState>): CityState {
        return {
            id: updates.id || 'test',
            name: updates.name || 'Test City',
            lastUpdated: updates.lastUpdated || Date.now(),
            isLoading: updates.isLoading || false,
            error: updates.error || null,
            coord: updates.coord || null,
            data: updates.data,
        };
    }
});