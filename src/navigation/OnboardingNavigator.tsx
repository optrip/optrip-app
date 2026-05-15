import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { IntroScreen } from '../screens/onboarding/IntroScreen';
import { InfoNoticeScreen } from '../screens/onboarding/InfoNoticeScreen';
import { NameInputScreen } from '../screens/onboarding/NameInputScreen';
import { GenderSelectScreen } from '../screens/onboarding/GenderSelectScreen';
import { BirthYearScreen } from '../screens/onboarding/BirthYearScreen';
import { JobSelectScreen } from '../screens/onboarding/JobSelectScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyTripsScreen } from '../screens/MyTripsScreen';
import { BudgetScreen } from '../screens/onboarding/BudgetScreen';
import type { OnboardingStackParamList } from './types';


const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="InfoNotice" component={InfoNoticeScreen} />
      <Stack.Screen
        name="NameInput"
        component={NameInputScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GenderSelect"
        component={GenderSelectScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BirthYear"
        component={BirthYearScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="JobSelect"
        component={JobSelectScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false, animation: 'slide_from_right' }} 
      />
      <Stack.Screen 
        name="MyTrips" 
        component={MyTripsScreen} 
        options={{ headerShown: false, animation: 'slide_from_left' }} 
      />
      <Stack.Screen 
        name="Budget" 
        component={BudgetScreen} 
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
