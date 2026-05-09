import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from './src/lib/queryClient';
import { OnboardingProvider } from './src/lib/onboardingStore';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <NavigationContainer>
            <OnboardingNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </OnboardingProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
