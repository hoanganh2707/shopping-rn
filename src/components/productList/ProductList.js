import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { SCREENS } from '~/constants';
import { cartActions } from '~/redux';
import { showMessageAddToCart } from '~/utils';
import { FixedBottom } from '../fixedBottom';
import { LoadingIndicator } from '../loadingIndicator';
import { ProductItem } from '../productItem';

export const ProductList = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data } = props;

  const handleDetail = (id) => {
    navigation.navigate(SCREENS.PRODUCT_DETAIL, {
      data: id,
    });
  };

  const handleAddToCart = (product) => {
    dispatch(cartActions.addToCart(product));
    showMessageAddToCart();
  };

  return (
    <>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <ProductItem
              data={item}
              onDetail={() => {
                handleDetail(item.id);
              }}
              onAddToCart={() => {
                handleAddToCart(item);
              }}
            />
          );
        }}
        ListEmptyComponent={!data && <LoadingIndicator />}
        ListFooterComponent={<FixedBottom />}
        style={styles.list}
      />
    </>
  );
};

ProductList.propTypes = {
  data: PropTypes.array,
};

const styles = StyleSheet.create({
  list: {
    marginTop: 4,
  },
});
