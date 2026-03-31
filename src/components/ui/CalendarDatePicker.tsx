import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarDatePicker.module.css';

type CalendarDatePickerProps = {
  describedBy?: string;
  invalid?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const VALUE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
});
const ACCESSIBLE_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
});

function toLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(viewDate: Date) {
  const firstDayOfMonth = startOfMonth(viewDate);
  const firstVisibleDay = addDays(firstDayOfMonth, -firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => addDays(firstVisibleDay, index));
}

function getWeekdayLabels() {
  const firstSunday = new Date(2026, 0, 4);
  return Array.from({ length: 7 }, (_, index) =>
    WEEKDAY_FORMATTER.format(addDays(firstSunday, index))
  );
}

export function CalendarDatePicker({
  describedBy,
  invalid = false,
  label,
  onChange,
  value,
}: CalendarDatePickerProps) {
  const selectedDate = toLocalDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startOfMonth(selectedDate));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusDateRef = useRef<string | null>(null);
  const dialogId = useId();
  const weekdayLabels = getWeekdayLabels();
  const calendarDays = buildCalendarDays(viewDate);

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

    const focusTargetDate = pendingFocusDateRef.current ?? value;
    const focusTarget = rootRef.current?.querySelector<HTMLButtonElement>(
      `button[data-date="${focusTargetDate}"]`
    );

    focusTarget?.focus();
    pendingFocusDateRef.current = null;
  }, [isOpen, value, viewDate]);

  function closeCalendar(returnFocus: boolean) {
    setIsOpen(false);

    if (returnFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function handleDaySelect(date: Date) {
    onChange(toIsoDateString(date));
    closeCalendar(true);
  }

  function handleDayKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, date: Date) {
    const keyToOffset: Record<string, number> = {
      ArrowDown: 7,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
    };

    if (event.key === 'Escape') {
      event.preventDefault();
      closeCalendar(true);
      return;
    }

    const offset = keyToOffset[event.key];

    if (offset === undefined) {
      return;
    }

    event.preventDefault();
    const nextDate = addDays(date, offset);
    pendingFocusDateRef.current = toIsoDateString(nextDate);
    setViewDate(startOfMonth(nextDate));
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-controls={dialogId}
        aria-describedby={describedBy}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-invalid={invalid}
        aria-label={`Choose departure date. ${ACCESSIBLE_DATE_FORMATTER.format(selectedDate)}`}
        className={styles.trigger}
        data-open={isOpen}
        onClick={() => {
          if (!isOpen) {
            pendingFocusDateRef.current = value;
            setViewDate(startOfMonth(selectedDate));
            setIsOpen(true);
            return;
          }

          setIsOpen(false);
        }}
        ref={triggerRef}
        type="button"
      >
        <CalendarDays aria-hidden="true" className={styles.icon} />
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{VALUE_FORMATTER.format(selectedDate)}</span>
        <span aria-hidden="true" className={styles.badge}>
          Edit
        </span>
      </button>

      {isOpen ? (
        <div
          aria-label="Choose departure date"
          className={styles.popover}
          id={dialogId}
          role="dialog"
        >
          <div className={styles.header}>
            <button
              aria-label="Previous month"
              className={styles['nav-button']}
              onClick={() => {
                const previousMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
                pendingFocusDateRef.current = value;
                setViewDate(previousMonth);
              }}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            <h3 className={styles['month-heading']}>{MONTH_FORMATTER.format(viewDate)}</h3>
            <button
              aria-label="Next month"
              className={styles['nav-button']}
              onClick={() => {
                const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
                pendingFocusDateRef.current = value;
                setViewDate(nextMonth);
              }}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>

          <div aria-hidden="true" className={styles['weekday-row']}>
            {weekdayLabels.map((weekday) => (
              <span className={styles.weekday} key={weekday}>
                {weekday}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {calendarDays.map((date) => {
              const isoDate = toIsoDateString(date);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isOutsideMonth = date.getMonth() !== viewDate.getMonth();

              return (
                <button
                  aria-label={ACCESSIBLE_DATE_FORMATTER.format(date)}
                  aria-pressed={isSelected}
                  className={[
                    styles['day-button'],
                    isSelected ? styles['day-selected'] : '',
                    isToday ? styles['day-today'] : '',
                    isOutsideMonth ? styles['day-muted'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-date={isoDate}
                  key={isoDate}
                  onClick={() => {
                    handleDaySelect(date);
                  }}
                  onKeyDown={(event) => {
                    handleDayKeyDown(event, date);
                  }}
                  type="button"
                >
                  <span>{date.getDate()}</span>
                  <span className={styles['sr-only']}>
                    {ACCESSIBLE_DATE_FORMATTER.format(date)}
                  </span>
                </button>
              );
            })}
          </div>

          <p aria-live="polite" className={styles['selection-summary']}>
            Selected {ACCESSIBLE_DATE_FORMATTER.format(selectedDate)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
