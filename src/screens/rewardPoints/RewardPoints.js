import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Header, Icon, Pressable, Text } from '~/components';
import { selectRewardPoints, selectRewardHistory } from '~/redux';
import { useTheme } from '~/config/ThemeContext';
import { moneyFormat } from '~/utils';

export const RewardPoints = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const points = useSelector(selectRewardPoints);
  const history = useSelector(selectRewardHistory);

  const styles = createStyles(colors);

  const renderHistoryItem = ({ item }) => {
    const isEarn = item.type === 'earn';
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyIcon}>
          <Icon
            name={isEarn ? 'star' : 'cart'}
            size="small"
            color={isEarn ? colors.success || '#4caf50' : colors.primary}
          />
        </View>
        <View style={styles.historyInfo}>
          <Text style={[styles.historyDesc, { color: colors.primaryText }]}>
            {item.description}
          </Text>
          <Text style={[styles.historyDate, { color: colors.tertiaryText }]}>
            {new Date(item.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <Text style={[styles.historyPoints, { color: isEarn ? (colors.success || '#4caf50') : colors.error }]}>
          {isEarn ? '+' : '-'}{item.points}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Header title={t('rewardPoints') || 'Điểm thưởng'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Points Card */}
        <View style={[styles.pointsCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.pointsLabel}>{t('yourPoints') || 'Điểm của bạn'}</Text>
          <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsEquiv}>
            ≈ {moneyFormat(points * 100)}
          </Text>
          <View style={styles.pointsInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('earnRate') || 'Tỷ lệ tích'}</Text>
              <Text style={styles.infoValue}>1% / {t('order') || 'đơn hàng'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('redeemRate') || 'Quy đổi'}</Text>
              <Text style={styles.infoValue}>1 {t('point') || 'điểm'} = 100đ</Text>
            </View>
          </View>
        </View>

        {/* How to earn */}
        <View style={[styles.howToEarn, { backgroundColor: colors.surface }]}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primaryText }]}>
            {t('howToEarn') || 'Cách tích điểm'}
          </Text>
          <View style={styles.earnRow}>
            <Text style={styles.earnIcon}>🛒</Text>
            <Text style={[styles.earnText, { color: colors.secondaryText }]}>
              {t('earnByPurchase') || 'Mua hàng: nhận 1% giá trị đơn hàng thành điểm'}
            </Text>
          </View>
          <View style={styles.earnRow}>
            <Text style={styles.earnIcon}>⭐</Text>
            <Text style={[styles.earnText, { color: colors.secondaryText }]}>
              {t('earnByReview') || 'Đánh giá sản phẩm: +10 điểm'}
            </Text>
          </View>
          <View style={styles.earnRow}>
            <Text style={styles.earnIcon}>📝</Text>
            <Text style={[styles.earnText, { color: colors.secondaryText }]}>
              {t('earnByComment') || 'Bình luận sản phẩm: +5 điểm'}
            </Text>
          </View>
        </View>

        {/* History */}
        <Text variant="titleSmall" style={[styles.historyTitle, { color: colors.primaryText }]}>
          {t('pointHistory') || 'Lịch sử điểm'}
        </Text>
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.secondaryText }}>
                {t('noPointHistory') || 'Chưa có lịch sử điểm'}
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  pointsCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  pointsLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
  pointsValue: { color: '#fff', fontSize: 48, fontWeight: 'bold', marginVertical: 8 },
  pointsEquiv: { color: '#fff', fontSize: 14, opacity: 0.8 },
  pointsInfo: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 24,
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { color: '#fff', fontSize: 12, opacity: 0.7 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 },
  howToEarn: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { marginBottom: 12 },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  earnIcon: { fontSize: 20 },
  earnText: { flex: 1, fontSize: 14 },
  historyTitle: { marginHorizontal: 16, marginBottom: 8 },
  historyList: { paddingHorizontal: 16 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: { flex: 1 },
  historyDesc: { fontSize: 14 },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingTop: 30 },
});

export default RewardPoints;
