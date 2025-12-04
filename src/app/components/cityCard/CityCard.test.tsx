import { render, screen, fireEvent } from '@testing-library/react';
import { CityCard } from './CityCard';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockCity: CityState = {
  id: 123,
  name: 'Kyiv',
  isLoading: false,
  error: null,
  lastUpdated: '2024-01-01T12:00:00Z',

  coord: { 
    lat: 50.45,
    lon: 30.52
  },

  data: {
    main: { temp: 10 },
    weather: [{ main: 'Clouds', icon: '02d' }],
    sys: { country: 'UA' },
    coord: { lat: 50.45, lon: 30.52 }
  }
};


describe('CityCard component', () => {

  test('renders city name', () => {
    render(
      <CityCard
        city={mockCity}
        onRefresh={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText('Kyiv')).toBeInTheDocument();
  });

  test('renders temperature', () => {
    render(
      <CityCard
        city={mockCity}
        onRefresh={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText('10°C')).toBeInTheDocument();
  });

  test('creates correct detail link URL', () => {
    render(
      <CityCard
        city={mockCity}
        onRefresh={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/cities/123?lat=50.45&lon=30.52'
    );
  });

  test('calls onRefresh when Update button is clicked', () => {
    const mockRefresh = jest.fn();

    render(
      <CityCard
        city={mockCity}
        onRefresh={mockRefresh}
        onRemove={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Update'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  test('calls onRemove when Delete button is clicked', () => {
    const mockRemove = jest.fn();

    render(
      <CityCard
        city={mockCity}
        onRefresh={jest.fn()}
        onRemove={mockRemove}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockRemove).toHaveBeenCalled();
  });
});
