
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from './CityCard';
import { CityState } from '../cityInfo/CityInfo'; 

interface MockLinkProps extends React.PropsWithChildren {
  href: string;
}

jest.mock('next/link', () => {
  return ({ children, href } : MockLinkProps) => (
    <a href={href} data-testid="city-link">
      {children}
    </a>
  );
});

const mockWeatherData = {
  main: { temp: 283.15 },
  weather: [{ main: 'Clouds', icon: '04d' }],
  sys: { country: 'UA' },
  coord: { lat: 49.84, lon: 24.03 },
};

const createMockCity = (updates: Partial<CityState> = {}): CityState => ({
  id: 'lviv-id',
  name: 'Lviv',
  data: (updates.data === null ? null : mockWeatherData) as any, 
  lastUpdated: Date.now(),
  isLoading: false,
  error: null,
  ...updates,
} as CityState)

describe('CityCard', () => {
  const mockOnRefresh = jest.fn();
  const mockOnRemove = jest.fn();

  test('renders city name, temperature, description, and update time correctly', () => {
    const mockCity = createMockCity({
      lastUpdated: new Date('2025-01-01T12:00:00Z').getTime(),
    });

    render(
      <CityCard city={mockCity} onRefresh={mockOnRefresh} onRemove={mockOnRemove} />
    );

    expect(screen.getByText('Lviv')).toBeInTheDocument();
    expect(screen.getByText('UA')).toBeInTheDocument();
    expect(screen.getByText('10°C')).toBeInTheDocument();
    expect(screen.getByText('Clouds')).toBeInTheDocument();
  });
  
  test('renders Loading state when isLoading is true', () => {
    const mockCity = createMockCity({
      isLoading: true,
      data: undefined, 
      lastUpdated: undefined,
    });

    render(
      <CityCard city={mockCity} onRefresh={mockOnRefresh} onRemove={mockOnRemove} />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const refreshButton = screen.getByRole('button', { name: '...' });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
  });

  test('renders error message when error is present', () => {
    const errorMessage = 'City not found';
    const mockCity = createMockCity({
      error: errorMessage,
      data: undefined,
    });

    render(
      <CityCard city={mockCity} onRefresh={mockOnRefresh} onRemove={mockOnRemove} />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
  });

  test('calls onRefresh and onRemove functions when buttons are clicked', () => {
    const mockCity = createMockCity({});

    render(
      <CityCard city={mockCity} onRefresh={mockOnRefresh} onRemove={mockOnRemove} />
    );

    const refreshButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(refreshButton);
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);

    const removeButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    
    const linkElement = screen.getByTestId('city-link');
    expect(linkElement).toHaveAttribute('href', '/cities/lviv-id?lat=49.84&lon=24.03');
  });
});