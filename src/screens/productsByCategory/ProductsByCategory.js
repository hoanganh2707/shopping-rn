import React, { useEffect, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';

import { productApi } from '~/apis';
import { CartBadge, Header, ProductList } from '~/components';

export const ProductsByCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { params } = route;

  const [data, setData] = useState();

  const category = params.category;

  const getProducts = async () => {
    const response = await productApi.getListByCategoryId(category.id);
    setData(response?.data);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <Header rightComponent={<CartBadge />} />
      <ProductList data={data} />
    </>
  );
};
