import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { productApi } from '~/apis';
import {
  FixedBottom,
  Header,
  IconButton,
  LoadingIndicator,
} from '~/components';
import { SCREENS } from '~/constants';
import { useGetListProductRealtime, useLoading } from '~/hooks';
import { colors } from '~/styles';
import { showMessage } from '~/utils';
import { ProductItem } from './components';

export const ProductList = () => {
  const { t } = useTranslation();
  const data = useGetListProductRealtime();
  // console.log(data);
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();

  const handleAdd = () => {
    navigation.navigate(SCREENS.PRODUCT_CREATE);
  };

  const handleShow = (item) => {
    // navigation.navigate(SCREENS.PRODUCT_SHOW, {});
  };

  const handleDelete = async (id) => {
    Alert.alert(t('delete'), t('deleteMessage'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => deleteCategory(id),
        style: 'destructive',
      },
    ]);
  };

  const deleteCategory = async (id) => {
    const response = await productApi.delete(id);
    showMessage(response.message);
  };

  const handleUpdate = async (item) => {
    navigation.navigate(SCREENS.PRODUCT_EDIT, {
      data: item,
    });
  };

  return (
    <>
      <Header
        title={t('screenNames.productList')}
        rightComponent={<IconButton name='plus' onPress={handleAdd} />}
      />
      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => (
          <ProductItem
            data={item}
            onShow={() => {
              handleShow(item);
            }}
            onDelete={() => {
              handleDelete(item.id);
            }}
            onUpdate={() => {
              handleUpdate(item);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={!data && <LoadingIndicator />}
        ListFooterComponent={<FixedBottom />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 12,
  },
  divider: {
    marginBottom: 4,
  },
});
