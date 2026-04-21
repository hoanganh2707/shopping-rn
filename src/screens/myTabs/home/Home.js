import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { categoryApi, productApi } from '~/apis';
import { images } from '~/assets';
import { Icon, Pressable, Text } from '~/components';
import { SCREENS, SCREEN_WIDTH } from '~/constants';
import { cartActions } from '~/redux';
import { showMessageAddToCart } from '~/utils';
import { Banner, CategoryItem, ProductItem, StickyHeader } from './components';

const ITEM_GAP = 16;
const NUM_COLUMS = 5;

const PRODUCT_ITEM_GAP = 0;

const BACKGROUNDS = [
  images.background1,
  images.background2,
  images.background3,
  images.background4,
  images.background5,
];

export const Home = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const recentlyViewedItems = useSelector((state) => state.recentlyViewed?.items || []);

  const [categories, setCategories] = useState([]);

  const [data, setData] = useState([]);

  const fetchCategories = async () => {
    const response = await categoryApi.getAll();
    setCategories(response?.data || []);
  };

  const fetchData = async () => {
    const categoryIds = categories.map((e) => e.id);

    const productPromises = categoryIds.map((categoryId) =>
      productApi.getListByCategoryId(categoryId),
    );

    const productsData = await Promise.all(productPromises);

    const productsDataFilter = productsData.filter(
      (e) => e?.data !== undefined && e?.data?.length !== 0,
    );

    // Add index to object
    const result = productsDataFilter.map((e, index) => ({
      index: index,
      ...e,
    }));
    setData(result);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    categories?.length !== 0 && fetchData();
  }, [categories]);

  const handleCategory = (category) => {
    navigation.navigate(SCREENS.PRODUCTS_BY_CATEGORY, {
      category,
    });
  };

  const handleProductDetail = (product) => {
    navigation.navigate(SCREENS.PRODUCT_DETAIL, {
      data: product.id,
    });
  };

  const handleAddToCart = (product) => {
    dispatch(cartActions.addToCart(product));
    showMessageAddToCart();
  };

  const navigateToSearch = () => {
    navigation.navigate(SCREENS.SEARCH);
  };

  return (
    <>
      <StickyHeader onSearch={navigateToSearch}>
        <View style={{}}>
          <Banner />
          <FlatList
            scrollEnabled={false}
            numColumns={NUM_COLUMS}
            contentContainerStyle={styles.list}
            data={categories?.slice(0, 10)}
            renderItem={({ item }) => (
              <CategoryItem
                data={item}
                numColumns={NUM_COLUMS}
                gap={ITEM_GAP}
                onPress={() => {
                  handleCategory(item);
                }}
              />
            )}
          />
          {recentlyViewedItems.length > 0 && (
            <ImageBackground
              style={styles.imageBackground}
              source={BACKGROUNDS[BACKGROUNDS.length - 1]}>
              <View style={styles.section}>
                <Text variant='headlineSmall' style={styles.header}>
                  {t('recentlyViewed') || 'Sản phẩm vừa xem'}
                </Text>
              </View>
              <FlatList
                contentContainerStyle={styles.productList}
                scrollEnabled={false}
                data={recentlyViewedItems.slice(0, 3)}
                renderItem={({ item }) => (
                  <ProductItem
                    data={item}
                    onDetail={() => handleProductDetail(item)}
                    onAddToCart={() => handleAddToCart(item)}
                  />
                )}
              />
            </ImageBackground>
          )}
          <SectionList
            scrollEnabled={false}
            sections={data}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => <View></View>}
            renderSectionHeader={({ section, index }) => {
              const categoryKey =
                section?.data[0]?.category?._key?.path?.segments?.at(-1);
              const category = categories?.find((e) => e.id === categoryKey);

              const imageBackground =
                BACKGROUNDS[section.index % BACKGROUNDS.length];
              return (
                <ImageBackground
                  style={styles.imageBackground}
                  source={imageBackground}>
                  <View style={styles.section}>
                    <Text variant='headlineSmall' style={styles.header}>
                      {category?.name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        handleCategory(category);
                      }}
                      style={styles.viewAll}>
                      <Text>{t('viewAll')}</Text>
                      <Icon size='xSmall' name='right' />
                    </Pressable>
                  </View>
                  <FlatList
                    contentContainerStyle={styles.productList}
                    scrollEnabled={false}
                    data={section.data.slice(0, 4)}
                    renderItem={({ item }) => {
                      return (
                        <ProductItem
                          data={item}
                          onDetail={() => {
                            handleProductDetail(item);
                          }}
                          onAddToCart={() => {
                            handleAddToCart(item);
                          }}
                        />
                      );
                    }}
                  />
                </ImageBackground>
              );
            }}
          />
        </View>
      </StickyHeader>
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    marginHorizontal: ITEM_GAP,
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 20,
  },

  productList: {
    gap: PRODUCT_ITEM_GAP,
    paddingHorizontal: PRODUCT_ITEM_GAP,
    marginBottom: 20,
  },

  /** Section */
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PRODUCT_ITEM_GAP,
    alignItems: 'center',
    marginVertical: 12,
  },
  header: {},
  viewAll: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: SCREEN_WIDTH,
  },
});
