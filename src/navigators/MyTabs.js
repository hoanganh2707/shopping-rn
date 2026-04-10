import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { useSelector } from 'react-redux';
import { Icon } from '~/components';
import { SCREENS } from '~/constants';
import { selectBadge } from '~/redux';
import { Account, Cart, Category, Home, Notification } from '~/screens';
import { colors } from '~/styles';

const Tab = createBottomTabNavigator();

export const MyTabs = () => {
  const { t } = useTranslation([], { keyPrefix: 'screenNames' });
  const badge = useSelector(selectBadge);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholderText,
        tabBarBadgeStyle: {
          backgroundColor: colors.notification,
        },
      }}>
      <Tab.Screen
        name={SCREENS.HOME}
        component={Home}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => <Icon name='home' color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREENS.CATEGORY}
        component={Category}
        options={{
          tabBarLabel: t('category'),
          tabBarIcon: ({ color, size }) => (
            <Icon name='category' color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.CART}
        component={Cart}
        options={{
          tabBarLabel: t('cart'),
          tabBarIcon: ({ color, size }) => <Icon name='cart' color={color} />,
          tabBarBadge: badge,
        }}
      />
      <Tab.Screen
        name={SCREENS.NOTIFICATION}
        component={Notification}
        options={{
          tabBarLabel: t('notification'),
          tabBarIcon: ({ color, size }) => (
            <Icon name='notification' color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.ACCOUNT}
        component={Account}
        options={{
          tabBarLabel: t('account'),
          tabBarIcon: ({ color, size }) => (
            <Icon name='account' color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
