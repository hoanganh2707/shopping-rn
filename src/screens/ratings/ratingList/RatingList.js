import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ratingApi } from '~/apis';
import { FixedBottom, Header, LoadingIndicator } from '~/components';
import { useGetListRatingRealtime } from '~/hooks';
import { showMessage } from '~/utils';
import { RatingItem } from './components';

export const RatingList = () => {
  const { t } = useTranslation();
  const data = useGetListRatingRealtime();

  const handleDelete = async (id) => {
    Alert.alert(t('delete'), t('deleteMessage'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => deleteRating(id),
        style: 'destructive',
      },
    ]);
  };

  const deleteRating = async (id) => {
    const response = await ratingApi.delete(id);
    showMessage(response.message);
  };

  return (
    <>
      <Header title={t('screenNames.ratingList')} />
      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => (
          <RatingItem
            data={item}
            onDelete={() => {
              handleDelete(item.id);
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
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 12,
  },
  divider: {
    marginBottom: 4,
  },
});
