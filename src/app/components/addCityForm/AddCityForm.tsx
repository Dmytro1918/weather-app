'use client';
import React, { useState } from 'react';
import styles from '@/app/styles/components/addCityForm.module.scss';
import { Button } from '@mui/material';

interface AddCityFormProps {
    onAddCity: (cityName: string) => Promise<void>;
}

export const AddCityForm: React.FC<AddCityFormProps> = ({ onAddCity }) => {
    const [cityName, setCityName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedName = cityName.trim();
        if (!trimmedName) {
            alert('The form is empty!');
            return;
        }
        setIsSubmitting(true);
        try {
            await onAddCity(trimmedName);            
            setCityName('');
        } catch (error) {
            console.log('Issue while sending for:', error);
            return
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.addCityForm}>
            <input
                className={styles.inputWrap}
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Please enter the city"
                disabled={isSubmitting}
                aria-label="City"
            />
            <Button variant="outlined" size="large" type="submit" id='add-city-button ' disabled={isSubmitting || !cityName.trim()}>
                {isSubmitting ? 'Wait, adding a city...' : 'Add a city'}
            </Button>
        </form>
    );
};