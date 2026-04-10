import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useNavigation } from '@react-navigation/native';
import { commentApi } from '~/apis';
import { FixedBottom, Header, LoadingIndicator } from '~/components';
import { SCREENS } from '~/constants';
import { useGetListCommentRealtime } from '~/hooks';
import { showMessage } from '~/utils';
import { CommentItem } from './components';

export const MyCommentList = () => {
  const { t } = useTranslation();
  const data = useGetListCommentRealtime();
  const navigation = useNavigation();

  const handleDelete = async (id) => {
    Alert.alert(t('delete'), t('deleteMessage'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => deleteComment(id),
        style: 'destructive',
      },
    ]);
  };

  const deleteComment = async (id) => {
    const response = await commentApi.delete(id);
    showMessage(response.message);
  };

  const handleReply = async (id) => {
    navigation.navigate(SCREENS.COMMENT_REPLY, {
      id,
    });
  };

  return (
    <>
      <Header title={t('myCommentList')} />
      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => (
          <CommentItem
            data={item}
            onDelete={() => {
              handleDelete(item.id);
            }}
            onReply={() => {
              handleReply(item.id);
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
