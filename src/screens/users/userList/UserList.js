import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { userApi } from '~/apis';
import { Header, LoadingIndicator } from '~/components';
import { colors } from '~/styles';
import { UserItem } from './components';

export const UserList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState();

  const fetchUserList = async () => {
    const response = await userApi.getAll();
    if (response.status === 'success') {
      setData(response.data);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title={t('screenNames.userList')}
        //   rightComponent={<IconButton name='plus' />}
      />
      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => <UserItem data={item} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={!data && <LoadingIndicator />}
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
