import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryApi } from '~/apis';
import { Divider, LoadingIndicator, SearchBox, Text } from '~/components';
import { SCREENS } from '~/constants';
import { colors } from '~/styles';
import { CategoryItem } from './components';

const ITEM_GAP = 16;
const NUM_COLUMS = 4;

export const Category = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [data, setData] = useState();

  const fetchCategory = async () => {
    const response = await categoryApi.getAll();
    setData(response?.data);
  };

  const navigateToSearch = () => {
    navigation.navigate(SCREENS.SEARCH);
  };

  const handleDetail = (category) => {
    navigation.navigate(SCREENS.PRODUCTS_BY_CATEGORY, {
      category,
    });
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <SearchBox onPress={navigateToSearch} style={styles.searchBox} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.stickyHeader}>
            <Text variant='titleMedium' style={styles.stickHeaderText}>
              {t('categoryScreen.productCategories')}
            </Text>
            <Divider />
          </View>
        }
        numColumns={NUM_COLUMS}
        contentContainerStyle={styles.list}
        data={data}
        renderItem={({ item }) => (
          <CategoryItem
            data={item}
            onPress={() => {
              handleDetail(item);
            }}
            numColumns={NUM_COLUMS}
            gap={ITEM_GAP}
          />
        )}
        ListEmptyComponent={
          !data && (
            <View style={styles.viewEmpty}>
              <LoadingIndicator />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  stickyHeader: {},
  stickHeaderText: {
    marginTop: 12,
    marginBottom: 12,
  },
  list: {
    marginHorizontal: ITEM_GAP,
    flex: 1,
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  viewEmpty: {
    marginTop: 8,
  },
});
