import styles from "./page.module.css";
import { CityInfo } from "./components/cityInfo/CityInfo";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <CityInfo>
        </CityInfo>
      </main>
    </div>
  );
}
