import { Pressable, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { spacing } from '../lib/theme';

export function ChevronBackButton() {
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.wrap}>
      <View style={styles.chevron} />
    </Pressable>
  );
}

const SIZE = 14;

const styles = StyleSheet.create({
  wrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  chevron: {
    width: SIZE,
    height: SIZE,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#000',
    transform: [{ rotate: '45deg' }],
    marginLeft: 6,
  },
});
