import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { formatISO } from 'date-fns';
import { store } from './src/state/store';

function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>IC App</Text>
      <Text style={{ textAlign: 'center', color: '#444' }}>
        Android-first Expo client. Configure API base URL via env (see ENV_SETUP.md). Boot:{' '}
        {formatISO(new Date())}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <HomeScreen />
    </Provider>
  );
}
