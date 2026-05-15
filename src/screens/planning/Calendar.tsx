import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors } from '../../lib/theme';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type DateString = string;

function toDateString(year: number, month: number, day: number): DateString {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function compare(a: DateString, b: DateString) {
  return a < b ? -1 : a > b ? 1 : 0;
}

type Props = {
  value: { start: DateString | null; end: DateString | null };
  onChange: (range: { start: DateString | null; end: DateString | null }) => void;
};

export function Calendar({ value, onChange }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const cells = useMemo(() => {
    const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const prevDays = new Date(cursor.year, cursor.month, 0).getDate();
    const result: { date: DateString; day: number; muted: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevDays - i;
      const m = cursor.month === 0 ? 11 : cursor.month - 1;
      const y = cursor.month === 0 ? cursor.year - 1 : cursor.year;
      result.push({ date: toDateString(y, m, day), day, muted: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: toDateString(cursor.year, cursor.month, d), day: d, muted: false });
    }
    while (result.length % 7 !== 0) {
      const idx = result.length - daysInMonth - firstDay + 1;
      const m = cursor.month === 11 ? 0 : cursor.month + 1;
      const y = cursor.month === 11 ? cursor.year + 1 : cursor.year;
      result.push({ date: toDateString(y, m, idx), day: idx, muted: true });
    }
    return result;
  }, [cursor]);

  const handlePress = (date: DateString) => {
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: date, end: null });
      return;
    }
    if (compare(date, start) < 0) {
      onChange({ start: date, end: start });
    } else if (date === start) {
      onChange({ start, end: start });
    } else {
      onChange({ start, end: date });
    }
  };

  const isInRange = (date: DateString) => {
    const { start, end } = value;
    if (!start) return false;
    if (!end) return date === start;
    return compare(date, start) >= 0 && compare(date, end) <= 0;
  };

  const isEnd = (date: DateString) => date === value.start || date === value.end;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            setCursor((c) =>
              c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 },
            )
          }
          hitSlop={12}
          style={styles.arrow}
        >
          <View style={styles.arrowLeft} />
        </Pressable>
        <Text style={styles.headerLabel}>
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </Text>
        <Pressable
          onPress={() =>
            setCursor((c) =>
              c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 },
            )
          }
          hitSlop={12}
          style={styles.arrow}
        >
          <View style={styles.arrowRight} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.headCell}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c, i) => {
          const range = isInRange(c.date);
          const ends = isEnd(c.date);
          return (
            <Pressable
              key={`${c.date}-${i}`}
              onPress={() => !c.muted && handlePress(c.date)}
              style={styles.cell}
            >
              <View
                style={[styles.cellInner, range && !ends && styles.cellMid, ends && styles.cellEnd]}
              >
                <Text
                  style={[
                    styles.cellText,
                    c.muted && styles.cellMuted,
                    ends && styles.cellTextOnEnd,
                  ]}
                >
                  {c.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  arrowRight: {
    width: 10,
    height: 10,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
  },
  headCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellMid: {
    backgroundColor: colors.rangeMid,
  },
  cellEnd: {
    backgroundColor: colors.rangeEnd,
  },
  cellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  cellTextOnEnd: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cellMuted: {
    color: '#CCCCCC',
  },
});
