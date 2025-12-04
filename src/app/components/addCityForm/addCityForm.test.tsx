
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddCityForm } from './AddCityForm'; // Переконайтеся, що шлях до компонента правильний
import '@testing-library/jest-dom';


interface MockButtonProps extends React.ComponentProps<'button'> {
  children?: React.ReactNode;
  variant?: 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

jest.mock('@mui/material', () => ({
  Button: ({ children, ...props } : MockButtonProps) => (
    <button {...props} data-testid="add-city-button">
      {children}
    </button>
  ),
}));

const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('AddCityForm', () => {
  const mockOnAddCity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAddCity.mockResolvedValue(undefined); 
  });

  test('renders input and button correctly', () => {
    render(<AddCityForm onAddCity={mockOnAddCity} />);
    
    const input = screen.getByPlaceholderText('Please enter the city');
    expect(input).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<AddCityForm onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText('Please enter the city');
    
    fireEvent.change(input, { target: { value: 'Kyiv' } });
    
    expect(input).toHaveValue('Kyiv');
    
    const button = screen.getByTestId('add-city-button');
    expect(button).not.toBeDisabled();
  });

  test('calls onAddCity with trimmed value and clears input on success', async () => {
    render(<AddCityForm onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText('Please enter the city');
    const button = screen.getByTestId('add-city-button');
    
    const cityNameWithSpaces = '  Lviv  ';
    const trimmedCityName = 'Lviv';

    fireEvent.change(input, { target: { value: cityNameWithSpaces } });
    expect(input).toHaveValue(cityNameWithSpaces);
    
    fireEvent.click(button);
    
    expect(button).toHaveTextContent('Wait, adding a city...');
    expect(button).toBeDisabled();

    await waitFor(() => expect(mockOnAddCity).toHaveBeenCalledTimes(1));
    
    expect(mockOnAddCity).toHaveBeenCalledWith(trimmedCityName);
    
    expect(input).toHaveValue('');
    
    expect(button).toHaveTextContent('Add a city');
    expect(button).toBeDisabled();
  });
  
  test('shows alert and does not call onAddCity if input contains only spaces', () => {
    render(<AddCityForm onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText('Please enter the city');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: '   ' } });
    
    const button = screen.getByTestId('add-city-button');
    expect(button).toBeDisabled();
    
    fireEvent.submit(form);
    
    expect(mockAlert).toHaveBeenCalledWith('The form is empty!');
    expect(mockOnAddCity).not.toHaveBeenCalled();
  });
  
  test('handles error and resets submitting state', async () => {
    const error = new Error('City already exists');
    mockOnAddCity.mockRejectedValue(error); 
    render(<AddCityForm onAddCity={mockOnAddCity} />);
    const input = screen.getByPlaceholderText('Please enter the city');
    const button = screen.getByTestId('add-city-button');
    
    fireEvent.change(input, { target: { value: 'Odesa' } });
    fireEvent.click(button);

    expect(button).toHaveTextContent('Wait, adding a city...');
    expect(input).toBeDisabled();

    await waitFor(() => expect(mockOnAddCity).toHaveBeenCalledTimes(1));

    expect(mockConsoleLog).toHaveBeenCalledWith('Issue while sending for:', error);

    expect(button).toHaveTextContent('Add a city');
    expect(button).not.toBeDisabled();
    
    expect(input).toHaveValue('Odesa'); 
  });
});

afterAll(() => {
    mockAlert.mockRestore();
    mockConsoleLog.mockRestore();
});