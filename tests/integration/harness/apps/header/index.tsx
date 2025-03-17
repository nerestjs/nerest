import { useEffect, useState } from 'react';
import type { HeaderProps } from './schema';
import styles from './index.module.css';

export default function HeaderApp({
  countdownSeconds,
  affirmation,
}: HeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prevSeconds) => Math.max(prevSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  });

  return (
    <header className={styles.header}>
      <a href="#" className={styles.logo}>
        Nerest Tutorial
        <button type="button" onClick={() => setClickCount((c) => c + 1)}>
          {clickCount}
        </button>
      </a>
      <nav className={styles.nav}>
        <div>{affirmation}</div>
      </nav>
      <div className={styles.countdown}>{secondsLeft} seconds left</div>
    </header>
  );
}
