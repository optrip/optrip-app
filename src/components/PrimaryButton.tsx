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
    width: '100%',
    backgroundColor: colors.actionPrimary,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.actionPrimaryDisabled,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
