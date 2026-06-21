import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native'; // ActivityIndicator 삭제

import { PhoneFrame } from './src/components/PhoneFrame';
import { queryClient } from './src/lib/queryClient';
import { OnboardingProvider, useOnboarding } from './src/lib/onboardingStore';
import { PlanningProvider } from './src/lib/planningStore';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';

// 저장소 복원이 끝난 뒤에만 네비게이터를 렌더링한다.
// 이미 온보딩을 완료한 사용자는 새로고침 시 곧바로 Home 으로 진입.

function Root() {
  const { onboarded } = useOnboarding();

  return (
    <NavigationContainer>
      <OnboardingNavigator initialRouteName={onboarded ? 'Home' : 'Welcome'} />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PhoneFrame>
        <SafeAreaProvider>
          <OnboardingProvider>
            <PlanningProvider>
              <Root />
            </PlanningProvider>
          </OnboardingProvider>
        </SafeAreaProvider>
      </PhoneFrame>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});