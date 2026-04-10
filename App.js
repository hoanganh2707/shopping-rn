import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';

import { PortalProvider } from '@gorhom/portal';
import { useTranslation } from 'react-i18next';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { LoadingOverlay } from '~/components';
import { useDeepLinking } from '~/hooks/useDeepLinking';
import { AppNavigator } from '~/navigators';
import { persistor, selectIsLoading, store } from '~/redux';
import '~/translations';
import { ignoreWarnings } from '~/utils';

ignoreWarnings();

const AppContainer = () => {
  const { t, i18n } = useTranslation();
  const isLoading = useSelector(selectIsLoading);
  const lang = useSelector((state) => state.app.lang);

  // Khởi tạo deep linking
  useDeepLinking();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle='dark-content'
          backgroundColor='transparent'
          translucent
        />
        <PortalProvider>
          <AppNavigator />
        </PortalProvider>
        {isLoading && <LoadingOverlay />}
        <FlashMessage position='bottom' />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
