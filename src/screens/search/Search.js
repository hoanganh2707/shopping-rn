import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { productApi } from '~/apis';
import { Button, CartBadge, Header, Icon, Input, Pressable, ProductList, Text } from '~/components';
import { useTheme } from '~/config/ThemeContext';

const SORT_OPTIONS = [
  { key: 'default', labelKey: 'sort' },
  { key: 'price_asc', labelKey: 'sortByPriceLow' },
  { key: 'price_desc', labelKey: 'sortByPriceHigh' },
  { key: 'newest', labelKey: 'sortByNewest' },
];

export const Search = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const searchRef = useRef();

  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState();
  const [sortBy, setSortBy] = useState('default');
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minStar, setMinStar] = useState(0);

  const getData = async () => {
    const response = await productApi.searchByName(keyword);
    if (response?.data) {
      setData(response.data);
    }
  };

  const handleSubmitEditing = () => {
    if (keywordNotEmpty) {
      getData();
      searchRef?.current?.blur();
    }
  };

  const keywordNotEmpty = useMemo(() => {
    return keyword?.trim() !== '';
  }, [keyword]);

  useEffect(() => {
    if (!keywordNotEmpty) {
      setData([]);
      searchRef?.current?.focus();
    }
  }, [keyword]);

  // Apply sorting and filtering
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return data;
    
    let result = [...data];
    
    // Filter by price range
    if (minPrice) {
      result = result.filter((p) => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseInt(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        result.reverse();
        break;
    }
    
    return result;
  }, [data, sortBy, minPrice, maxPrice, minStar]);

  const handleResetFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinStar(0);
    setSortBy('default');
    setShowFilter(false);
  };

  const handleApplyFilter = () => {
    setShowFilter(false);
  };

  return (
    <>
      <Header
        titleComponent={
          <View style={{ flex: 6 }}>
            <Input
              value={keyword}
              onChangeText={setKeyword}
              ref={searchRef}
              autoCapitalize='sentences'
              returnKeyType='search'
              onSubmitEditing={() => {
                handleSubmitEditing();
              }}
              autoFocus
              blurOnSubmit={false}
            />
          </View>
        }
        rightComponent={<CartBadge />}
      />

      {/* Sort & Filter Bar */}
      {data && keywordNotEmpty && (
        <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.resultCount, { color: colors.secondaryText }]}>
            {filteredData?.length || 0} {t('results')}
          </Text>
          <View style={styles.filterActions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
              {SORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSortBy(opt.key)}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: sortBy === opt.key ? colors.primary + '20' : colors.background,
                      borderColor: sortBy === opt.key ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text style={[
                    styles.sortChipText,
                    { color: sortBy === opt.key ? colors.primary : colors.secondaryText },
                  ]}>
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowFilter(true)}
              style={[styles.filterBtn, { borderColor: colors.border }]}>
              <Icon name="category" size="xSmall" color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12 }}>{t('filter')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {filteredData && keywordNotEmpty && <ProductList data={filteredData} />}

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleMedium" style={{ color: colors.primaryText }}>
                {t('filter')}
              </Text>
              <Pressable onPress={() => setShowFilter(false)}>
                <Icon name="close" size="small" color={colors.tertiaryText} />
              </Pressable>
            </View>

            <Text variant="titleSmall" style={[styles.filterLabel, { color: colors.primaryText }]}>
              {t('priceRange') || 'Khoảng giá'}
            </Text>
            <View style={styles.priceRow}>
              <Input
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder={t('minPrice') || 'Giá thấp nhất'}
                keyboardType="numeric"
                style={styles.priceInput}
              />
              <Text style={{ color: colors.secondaryText }}> — </Text>
              <Input
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder={t('maxPrice') || 'Giá cao nhất'}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>

            <Text variant="titleSmall" style={[styles.filterLabel, { color: colors.primaryText }]}>
              {t('starRating') || 'Đánh giá sao'}
            </Text>
            <View style={styles.starRow}>
              {[0, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setMinStar(star)}
                  style={[
                    styles.starChip,
                    {
                      backgroundColor: minStar === star ? colors.primary + '20' : colors.background,
                      borderColor: minStar === star ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text style={{ color: minStar === star ? colors.primary : colors.secondaryText }}>
                    {star === 0 ? t('viewAll') : `${star}⭐ +`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.filterButtons}>
              <Button
                title={t('resetFilter') || 'Đặt lại'}
                onPress={handleResetFilter}
                variant="outline"
                style={styles.filterBtnAction}
              />
              <Button
                title={t('applyFilter') || 'Áp dụng'}
                onPress={handleApplyFilter}
                style={styles.filterBtnAction}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultCount: {
    fontSize: 12,
    marginBottom: 6,
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortScroll: {
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sortChipText: {
    fontSize: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  priceInput: {
    flex: 1,
  },
  starRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  starChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterBtnAction: {
    flex: 1,
  },
});
