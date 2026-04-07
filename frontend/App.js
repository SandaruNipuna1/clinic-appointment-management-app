import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorListScreen from './screens/doctors/DoctorListScreen';
import DoctorDetailScreen from './screens/doctors/DoctorDetailScreen';
import AddDoctorScreen from './screens/doctors/AddDoctorScreen';
import EditDoctorScreen from './screens/doctors/EditDoctorScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Doctors' }} />
        <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor Details' }} />
        <Stack.Screen name="AddDoctor" component={AddDoctorScreen} options={{ title: 'Add Doctor' }} />
        <Stack.Screen name="EditDoctor" component={EditDoctorScreen} options={{ title: 'Edit Doctor' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
