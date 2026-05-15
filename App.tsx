import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { PhoneFrame } from './src/components/PhoneFrame';
import { queryClient } from './src/lib/queryClient';
import { OnboardingProvider } from './src/lib/onboardingStore';
import { PlanningProvider } from './src/lib/planningStore';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PhoneFrame>
        <SafeAreaProvider>
          <OnboardingProvider>
            <PlanningProvider>
              <NavigationContainer>
                <OnboardingNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </PlanningProvider>
          </OnboardingProvider>
        </SafeAreaProvider>
      </PhoneFrame>
    </QueryClientProvider>
  );
}
