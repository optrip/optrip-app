import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

import { colors } from '../lib/theme';

type Props = PressableProps & {
  label: string;
};

export function SecondaryButton({ label, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [styles.button, typeof style === 'function' ? style(state) : style]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.actionSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textStrong,
  },
});
