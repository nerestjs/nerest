import {lazy, Suspense, useEffect, useState} from 'react';
import type { HeaderProps } from './schema';
import styles from './index.module.css';

const List = lazy(() => import('./list-component.tsx'));

export default function HeaderApp({
  countdownSeconds,
  affirmation,
}: HeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [clickCount, setClickCount] = useState(0);
  const [isListVisible, setIsListVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prevSeconds) => Math.max(prevSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsListVisible(true), countdownSeconds * 1000);

    return () => clearTimeout(timer);
  }, [countdownSeconds]);

  return (
    <>
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
      {isListVisible && (
        <Suspense>
          <List />
        </Suspense>
      )}
    </>
  );
}
