import styles from '../LiveNavigation.module.css';
import type { LiveNavigationManualStart } from '../liveNavigationData';

type ManualStartSelectorProps = {
  onChange: (startId: string) => void;
  options: LiveNavigationManualStart[];
  selectedStartId: string | null;
};

export function ManualStartSelector({
  onChange,
  options,
  selectedStartId,
}: ManualStartSelectorProps) {
  return (
    <section aria-labelledby="manual-start-heading" className={styles['manual-start-section']}>
      <h2 id="manual-start-heading">Manuellen Startpunkt wählen</h2>
      <div
        aria-label="Manuellen Startpunkt wählen"
        className={styles['manual-start-options']}
        role="radiogroup"
      >
        {options.map((option) => {
          const checked = option.id === selectedStartId;

          return (
            <label className={styles['manual-start-option']} key={option.id}>
              <input
                checked={checked}
                name="manual-start"
                type="radio"
                onChange={() => onChange(option.id)}
              />
              <span>{option.label}</span>
              <span>{option.description}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
