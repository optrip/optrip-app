import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing } from '../lib/theme';

export function BackLink() {
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.wrap}>
      <Text style={styles.text}>이전</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
