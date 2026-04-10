import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Text } from '~/components';
import { colors } from '~/styles';

export const UserItem = (props) => {
  const { data } = props;

  return (
    <View style={styles.container}>
      <Avatar source={{ uri: data?.photoURL }} style={styles.avatar} />
      <View>
        <Text>{data?.fullname}</Text>
        <Text>{data?.email}</Text>
      </View>
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
});

UserItem.propTypes = {
  data: PropTypes.object,
};
