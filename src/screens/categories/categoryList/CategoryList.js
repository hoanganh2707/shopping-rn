import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { categoryApi } from '~/apis';
import {
  FixedBottom,
  Header,
  IconButton,
  LoadingIndicator,
} from '~/components';
import { SCREENS } from '~/constants';
import { useGetListCategoryRealtime, useLoading } from '~/hooks';
import { colors } from '~/styles';
import { showMessage } from '~/utils';
import { CategoryItem } from './components';

export const CategoryList = () => {
  const { t } = useTranslation();
  const data = useGetListCategoryRealtime();
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();

  const handleAdd = () => {
    navigation.navigate(SCREENS.CATEGORY_CREATE);
  };

  const handleShow = (item) => {
    // navigation.navigate(SCREENS.CATEGORY_SHOW, {});
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
    const response = await categoryApi.delete(id);
    showMessage(response.message);
  };

  const handleUpdate = async (item) => {
    navigation.navigate(SCREENS.CATEGORY_EDIT, {
      data: item,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('screenNames.categoryList')}
        rightComponent={<IconButton name='plus' onPress={handleAdd} />}
      />
      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => (
          <CategoryItem
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: 12,
  },
  divider: {
    marginBottom: 4,
  },
});
