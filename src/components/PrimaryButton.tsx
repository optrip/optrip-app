import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

import { colors } from '../lib/theme';

type Props = PressableProps & {
  label: string;
  disabled?: boolean;
};

export function PrimaryButton({ label, disabled, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.button,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.actionPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
