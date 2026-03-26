import { ChevronRight, Tag } from 'lucide-react';
import styles from './BahnCardBanner.module.css';

interface BahnCardBannerProps {
  onUpgrade: () => void;
}

export function BahnCardBanner({ onUpgrade }: BahnCardBannerProps) {
  return (
    <aside aria-label="BahnCard Angebot" className={styles.banner}>
      <div className={styles.icon} aria-hidden="true">
        <Tag />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Exklusives Angebot</p>
        <h3 className={styles.title}>BahnCard 50 — Jetzt upgraden</h3>
        <p className={styles.description}>
          Sparen Sie 50 % auf alle Verbindungen und genießen Sie barrierefreie Reiseassistenz.
        </p>
      </div>
      <button
        aria-label="BahnCard 50 Upgrade starten"
        className={styles.cta}
        type="button"
        onClick={onUpgrade}
      >
        <span>Mehr erfahren</span>
        <ChevronRight aria-hidden="true" className={styles['cta-icon']} />
      </button>
    </aside>
  );
}
