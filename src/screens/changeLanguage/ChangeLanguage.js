import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { RadioButton } from 'react-native-radio-buttons-group';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Divider, Header, Pressable, Text } from '~/components';
import { appActions, selectLang } from '~/redux';
import { colors } from '~/styles';

const Item = ({ selected, label, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text>{label}</Text>
      <RadioButton size={16} selected={selected} color='red' borderSize={1} />
    </Pressable>
  );
};

export const ChangeLanguage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const lang = useSelector(selectLang);

  const changeLanguage = (key) => {
    i18n.changeLanguage(key);
    dispatch(appActions.changeLanguage(key));
  };

  const data = [
    {
      key: 'en',
      label: t('english'),
      onPress: () => {
        changeLanguage('en');
      },
    },
    {
      key: 'vi',
      label: t('vietnamese'),
      onPress: () => {
        changeLanguage('vi');
      },
    },
  ];

  return (
    <>
      <Header title={t('screenNames.changeLanguage')} />
      <FlatList
        contentContainerStyle={styles.container}
        data={data}
        renderItem={({ item }) => (
          <Item {...item} selected={lang == item.key ? true : false} />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    marginTop: 4,
  },
});
