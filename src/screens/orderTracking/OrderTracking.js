import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Header, Icon, Text, Button } from '~/components';
import { useTheme } from '~/config/ThemeContext';

const TRACKING_STEPS = [
  { key: 'confirmed', icon: 'order', labelVi: 'Đã xác nhận', labelEn: 'Confirmed' },
  { key: 'processing', icon: 'category', labelVi: 'Đang chuẩn bị', labelEn: 'Processing' },
  { key: 'shipping', icon: 'cart', labelVi: 'Đang giao hàng', labelEn: 'Shipping' },
  { key: 'delivered', icon: 'star', labelVi: 'Đã giao hàng', labelEn: 'Delivered' },
];

const getStepIndex = (status) => {
  const statusMap = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    shipping: 2,
    delivering: 2,
    delivered: 3,
    completed: 3,
  };
  return statusMap[status] ?? 0;
};

export const OrderTracking = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const { orderCode, status, orderDate, estimatedDelivery } = route.params || {};
  const currentStep = getStepIndex(status);

  const styles = createStyles(colors);

  return (
    <>
      <Header title={t('trackOrder') || 'Theo dõi đơn hàng'} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Order Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
              {t('orderCode') || 'Mã đơn hàng'}
            </Text>
            <Text style={[styles.infoValue, { color: colors.primaryText }]}>
              {orderCode || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
              {t('orderDate') || 'Ngày đặt'}
            </Text>
            <Text style={[styles.infoValue, { color: colors.primaryText }]}>
              {orderDate ? new Date(orderDate).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
              {t('estimatedDelivery') || 'Dự kiến giao'}
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {estimatedDelivery || '2-3 ngày'}
            </Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={[styles.timeline, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={[styles.timelineTitle, { color: colors.primaryText }]}>
            {t('deliveryStatus') || 'Trạng thái giao hàng'}
          </Text>
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const isLast = index === TRACKING_STEPS.length - 1;

            return (
              <View key={step.key} style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <View style={[
                    styles.dot,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.border,
                      borderColor: isCurrent ? colors.primary : 'transparent',
                    },
                    isCurrent && styles.dotCurrent,
                  ]}>
                    <Icon
                      name={step.icon}
                      size="xSmall"
                      color={isCompleted ? '#fff' : colors.tertiaryText}
                    />
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.line,
                      { backgroundColor: isCompleted && index < currentStep ? colors.primary : colors.border },
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    {
                      color: isCompleted ? colors.primaryText : colors.tertiaryText,
                      fontWeight: isCurrent ? 'bold' : 'normal',
                    },
                  ]}>
                    {step.labelVi}
                  </Text>
                  {isCurrent && (
                    <Text style={[styles.stepStatus, { color: colors.primary }]}>
                      {t('currentStatus') || 'Trạng thái hiện tại'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  infoCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  timeline: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  timelineTitle: { marginBottom: 20 },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 70,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 40,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrent: {
    borderWidth: 3,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  line: {
    width: 3,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1.5,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 16,
  },
  stepLabel: { fontSize: 15 },
  stepStatus: { fontSize: 12, marginTop: 4 },
});

export default OrderTracking;
