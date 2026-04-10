import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { productApi } from '~/apis';
import { CartBadge, Header, Input, ProductList } from '~/components';

export const Search = () => {
  const searchRef = useRef();

  const [keyword, setKeyword] = useState('');

  const [data, setData] = useState();

  const getData = async () => {
    const response = await productApi.searchByName(keyword);
    if (response?.data) {
      setData(response.data);
    }
  };

  const handleSubmitEditing = () => {
    if (keywordNotEmpty) {
      getData();
      searchRef?.current?.blur();
    }
  };

  const keywordNotEmpty = useMemo(() => {
    return keyword?.trim() !== '';
  }, [keyword]);

  useEffect(() => {
    if (!keywordNotEmpty) {
      setData([]);
      searchRef?.current?.focus();
    }
  }, [keyword]);

  return (
    <>
      <Header
        titleComponent={
          <View style={{ flex: 6 }}>
            <Input
              value={keyword}
              onChangeText={setKeyword}
              ref={searchRef}
              autoCapitalize='sentences'
              returnKeyType='search'
              onSubmitEditing={() => {
                handleSubmitEditing();
              }}
              autoFocus
              blurOnSubmit={false}
            />
          </View>
        }
        rightComponent={<CartBadge />}
      />

      {data && keywordNotEmpty && <ProductList data={data} />}
    </>
  );
};

const styles = StyleSheet.create({
  con: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'red',
    flex: 1,
  },
});
