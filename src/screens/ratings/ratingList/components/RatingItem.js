import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Icon, IconButton, Text } from '~/components';
import { colors } from '~/styles';
import { getDate } from '~/utils';

export const RatingItem = (props) => {
  const { t } = useTranslation();
  const { data, onDelete } = props;

  const user = data?.user;

  return (
    <View style={styles.container}>
      <Avatar source={{ uri: user?.photoURL }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text>{user?.fullname}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>{data?.rating}&nbsp;</Text>
          <Icon color={colors.star} name='star' />
        </View>
        <Text>{getDate(data?.updatedAt)}</Text>
      </View>
      <IconButton name='remove' onPress={onDelete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  avatar: {
    marginRight: 16,
  },
  star: {},
});

RatingItem.propTypes = {
  data: PropTypes.object,
  onDelete: PropTypes.func,
};
