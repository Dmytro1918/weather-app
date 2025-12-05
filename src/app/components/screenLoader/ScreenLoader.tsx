import React from 'react';
import styles from '@/app/styles/components/screenLoader.module.scss';
import { FullScreenLoaderProps } from '@/app/types/weather';

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message }) => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default FullScreenLoader;