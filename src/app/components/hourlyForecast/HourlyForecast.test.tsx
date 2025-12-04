import React from 'react';
import { render, screen } from '@testing-library/react';
import { HourlyForecast } from './HourlyForecast';
import '@testing-library/jest-dom';

interface RechartsMockProps extends React.PropsWithChildren {
    [key: string]: any; 
}

interface LineMockProps {
    dataKey: string;
    [key: string]: any; 
}

jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: RechartsMockProps) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: RechartsMockProps) => <svg data-testid="line-chart">{children}</svg>,
    Line: (props: LineMockProps) => <path data-testid={`line-${props.dataKey}`} {...props} />,
    XAxis: () => <g data-testid="xaxis" />,
    YAxis: () => <g data-testid="yaxis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <g data-testid="cartesian-grid" />,
  };
});

const mockHourlyData = [
  {
    dt: 1678881600, 
    main: {
      temp: 293.15, 
      feels_like: 291.15, 
      humidity: 60,
      pressure: 1012,
    },
    wind: { speed: 5.5 },
    weather: [{ icon: '01d', description: 'clear sky' }],
  },
  {
    dt: 1678892400, 
    main: {
      temp: 295.15,
      feels_like: 294.15, 
      humidity: 55,
      pressure: 1010,
    },
    wind: { speed: 6.0 },
    weather: [{ icon: '02d', description: 'few clouds' }],
  },
];

describe('HourlyForecast', () => {
  test('renders "No hourly forecast data" message when data is empty or null', () => {
    const { rerender } = render(<HourlyForecast hourlyData={null as any} />);
    expect(screen.getByText('No hourly forecast data...')).toBeInTheDocument();
    rerender(<HourlyForecast hourlyData={[]} />);
    expect(screen.getByText('No hourly forecast data...')).toBeInTheDocument();
  });

  test('renders charts and hourly list on successful data load', () => {
    render(<HourlyForecast hourlyData={mockHourlyData} />);
    expect(screen.getByText('Temperature (°C)')).toBeInTheDocument();
    expect(screen.getByText('Wind speed (m/s)')).toBeInTheDocument();
    expect(screen.getAllByTestId('line-chart').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('line-temp').length).toBeGreaterThan(0);
    expect(screen.getByText('Weather every 3 hours')).toBeInTheDocument();
  });

  test('correctly transforms data to Celsius and time format', () => {
    render(<HourlyForecast hourlyData={mockHourlyData} />);
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });
});