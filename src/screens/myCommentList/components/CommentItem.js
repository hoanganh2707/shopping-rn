import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, IconButton, Text } from '~/components';
import { colors } from '~/styles';
import { getDate } from '~/utils';

export const CommentItem = (props) => {
  const { t } = useTranslation();
  const { data, onDelete } = props;

  const user = data?.user;

  return (
    <View style={styles.container}>
      <Avatar source={{ uri: user?.photoURL }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text>{user?.fullname}</Text>
        <Text color={colors.tertiaryText}>{getDate(data?.updatedAt)}</Text>
        <Text color={colors.tertiaryText}>
          <Text numberOfLine={2}>{data?.comment}&nbsp;</Text>
        </Text>

        {data?.reply && (
          <View style={styles.replyView}>
            <View style={styles.adminRow}>
              <Text>{t('admin')}</Text>
              <Text color={colors.tertiaryText}>
                {getDate(data?.reply?.updatedAt)}
              </Text>
            </View>
            <Text color={colors.tertiaryText}>{data?.reply?.text}</Text>
          </View>
        )}
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
    backgroundColor: colors.surface,
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 16,
  },
  star: {},
  replyView: {
    marginTop: 12,
  },
  adminRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});

CommentItem.propTypes = {
  data: PropTypes.object,
  onDelete: PropTypes.func,
};
