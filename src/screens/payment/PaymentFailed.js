import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Button, Header, Text } from '~/components';
import { SCREENS } from '~/constants';
import { colors } from '~/styles';

export const PaymentFailed = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const { params } = route;
  const { orderId, message } = params || {};

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MyTabs' }],
    });
  };

  const handleTryAgain = () => {
    if (orderId) {
      // Navigate back to payment method selection
      navigation.navigate(SCREENS.PAYMENT_METHOD_SELECTION, {
        orderId,
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <Header title={t('paymentFailed')} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>❌</Text>
          </View>

          <Text variant='titleLarge' style={styles.title}>
            {t('paymentFailed')}
          </Text>

          <Text variant='bodyMedium' style={styles.message}>
            {message || t('paymentFailedMessage')}
          </Text>

          {orderId && (
            <View style={styles.infoContainer}>
              <Text variant='bodySmall' style={styles.infoLabel}>
                {t('orderCode')}:
              </Text>
              <Text variant='bodyMedium' style={styles.infoValue}>
                {orderId}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title={t('tryAgain')}
            onPress={handleTryAgain}
            style={styles.button}
            block
          />
          <View style={styles.spacer} />
          <Button
            title={t('backToHome')}
            onPress={handleBackToHome}
            style={[styles.button, styles.secondaryButton]}
            variant='outline'
            block
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error || '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 48,
  },
  title: {
    marginBottom: 12,
    color: colors.primaryText,
    textAlign: 'center',
  },
  message: {
    marginBottom: 32,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    marginBottom: 4,
    color: colors.secondaryText,
  },
  infoValue: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 0,
  },
  spacer: {
    height: 8,
  },
});

