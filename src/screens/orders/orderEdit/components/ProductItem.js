import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Text } from '~/components';
import { colors } from '~/styles';
import { moneyFormat } from '~/utils';

export const ProductItem = (props) => {
  const { t } = useTranslation();
  const { data } = props;

  const { product } = data;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Avatar source={{ uri: product?.image }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text>{product?.name}</Text>
          <View style={styles.quantityView}>
            <Text style={{ flex: 1 }}>{`(x${data?.quantity})`}</Text>
            <Text>&nbsp;{moneyFormat(data?.price)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  quantityView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

ProductItem.propTypes = {
  data: PropTypes.object,
};
