import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Header, Icon, Text } from '~/components';

export const Notification = () => {
  const { t } = useTranslation();

  const NoNotifications = () => {
    return (
      <Text style={styles.noNotifications}>
        {t('notificationScreen.noNotifications')}
      </Text>
    );
  };

  return (
    <>
      <Header
        isBackVisible={false}
        title={t('screenNames.notification')}
        rightComponent={<Icon name='check-all' />}
      />
      <FlatList ListEmptyComponent={NoNotifications} />
    </>
  );
};

const styles = StyleSheet.create({
  noNotifications: {
    textAlign: 'center',
    marginTop: 20,
  },
});
