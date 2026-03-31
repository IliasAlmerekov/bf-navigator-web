import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Clock3 } from 'lucide-react';
import styles from './TimePicker.module.css';

type TimePickerProps = {
  describedBy?: string;
  invalid?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const GRID_COLUMNS = 4;

function buildTimeSlots() {
  return Array.from({ length: 96 }, (_, index) => {
    const hours = String(Math.floor(index / 4)).padStart(2, '0');
    const minutes = String((index % 4) * 15).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
}

export function TimePicker({
  describedBy,
  invalid = false,
  label,
  onChange,
  value,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusTimeRef = useRef<string | null>(null);
  const dialogId = useId();
  const timeSlots = useMemo(() => buildTimeSlots(), []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTargetTime = pendingFocusTimeRef.current ?? value;
    const focusTarget = rootRef.current?.querySelector<HTMLButtonElement>(
      `button[data-time="${focusTargetTime}"]`
    );

    focusTarget?.focus();
    focusTarget?.scrollIntoView?.({ block: 'nearest' });
    pendingFocusTimeRef.current = null;
  }, [isOpen, value]);

  function closePicker(returnFocus: boolean) {
    setIsOpen(false);

    if (returnFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function handleTimeKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const keyToOffset: Record<string, number> = {
      ArrowDown: GRID_COLUMNS,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -GRID_COLUMNS,
    };

    if (event.key === 'Escape') {
      event.preventDefault();
      closePicker(true);
      return;
    }

    const offset = keyToOffset[event.key];

    if (offset === undefined) {
      return;
    }

    event.preventDefault();

    const nextIndex = Math.max(0, Math.min(timeSlots.length - 1, index + offset));
    const nextTime = timeSlots[nextIndex];
    pendingFocusTimeRef.current = nextTime;

    const nextButton = rootRef.current?.querySelector<HTMLButtonElement>(
      `button[data-time="${nextTime}"]`
    );
    nextButton?.focus();
    nextButton?.scrollIntoView?.({ block: 'nearest' });
    pendingFocusTimeRef.current = null;
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-controls={dialogId}
        aria-describedby={describedBy}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-invalid={invalid}
        aria-label={`Choose departure time. ${value}`}
        className={styles.trigger}
        data-open={isOpen}
        onClick={() => {
          if (!isOpen) {
            pendingFocusTimeRef.current = value;
            setIsOpen(true);
            return;
          }

          setIsOpen(false);
        }}
        ref={triggerRef}
        type="button"
      >
        <Clock3 aria-hidden="true" className={styles.icon} />
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        <span aria-hidden="true" className={styles.badge}>
          Edit
        </span>
      </button>

      {isOpen ? (
        <div
          aria-label="Choose departure time"
          className={styles.popover}
          id={dialogId}
          role="dialog"
        >
          <div className={styles.header}>
            <p className={styles.eyebrow}>Departure Time</p>
            <h3 className={styles.heading}>{value}</h3>
            <p className={styles.description}>
              Choose a precise slot in the same polished picker style as the calendar.
            </p>
          </div>

          <div className={styles.grid}>
            {timeSlots.map((time, index) => {
              const isSelected = time === value;

              return (
                <button
                  aria-label={time}
                  aria-pressed={isSelected}
                  className={[
                    styles['time-button'],
                    isSelected ? styles['time-button-selected'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-time={time}
                  key={time}
                  onClick={() => {
                    onChange(time);
                    closePicker(true);
                  }}
                  onKeyDown={(event) => {
                    handleTimeKeyDown(event, index);
                  }}
                  type="button"
                >
                  {time}
                </button>
              );
            })}
          </div>

          <p aria-live="polite" className={styles['selection-summary']}>
            Selected {value}
          </p>
        </div>
      ) : null}
    </div>
  );
}
