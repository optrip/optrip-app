import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

import { colors, spacing } from '../lib/theme';

type Props = PressableProps & {
  label?: string;
};

export function SkipLink({ label = '건너뛰기', style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      style={(state) => [styles.wrap, typeof style === 'function' ? style(state) : style]}
      {...rest}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  text: {
    fontSize: 16,
    color: colors.skipText,
    textDecorationLine: 'underline',
  },
});
