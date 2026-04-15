import React from 'react';
import { Alert, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { authApi } from '~/apis';
import { ListItem } from '~/components';
import { ROLES, SCREENS } from '~/constants';
import { authActions, selectRole, selectUser } from '~/redux';
import { Header, UserCard } from './components';

export const Account = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  const navigateToLogin = () => {
    navigation.navigate(SCREENS.LOGIN);
  };

  const DATA = [
    {
      data: [
        {
          icon: 'order',
          title: t('orderManagement'),
          onPress: () => {
            if (role === ROLES.USER) {
              navigation.navigate(SCREENS.ORDER_MANAGEMENT);
            } else {
              navigateToLogin();
            }
          },
        },
        {
          icon: 'message',
          title: t('myCommentList'),
          onPress: () => {
            if (role === ROLES.USER) {
              navigation.navigate(SCREENS.MY_COMMENT_LIST);
            } else {
              navigateToLogin();
            }
          },
        },
        {
          icon: 'chatbot',
          title: t('chatbot'),
          onPress: () => {
            navigation.navigate(SCREENS.CHATBOT);
          },
        },
        {
          icon: 'heart',
          title: t('wishlist') || 'Danh sách yêu thích',
          onPress: () => {
            navigation.navigate(SCREENS.WISHLIST);
          },
        },
        {
          icon: 'language',
          title: t('changeLanguage'),
          bottomDivider: false,
          onPress: () => {
            navigation.navigate(SCREENS.CHANGE_LANGUAGE);
          },
        },
      ],
    },
    {
      data: [
        {
          icon: 'support',
          title: t('support'),
          onPress: () => {},
        },
        {
          icon: 'terms',
          title: t('termsAndPolicies'),
          bottomDivider: false,
          onPress: () => {},
        },
      ],
    },
    ...(role !== ROLES.GUEST
      ? [
          {
            data: [
              {
                icon: 'logout',
                title: t('logout'),
                bottomDivider: false,
                onPress: () => handleLogout(),
              },
            ],
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    Alert.alert(t(''), t('logout'), [
      {
        text: t('cancel'),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => {
          authApi.logout();
          dispatch(authActions.removeUser());
        },
        style: 'destructive',
      },
    ]);
  };

  const navigateToUserInfo = () => {
    navigation.navigate(SCREENS.USER_INFO);
  };

  return (
    <ScrollView style={styles.container}>
      {role === ROLES.USER ? (
        <UserCard user={user} onPress={navigateToUserInfo} />
      ) : (
        <Header onPress={navigateToLogin} />
      )}
      <SectionList
        scrollEnabled={false}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item, index }) => {
          return (
            <ListItem
              icon={item.icon}
              title={item.title}
              bottomDivider={item.bottomDivider ?? true}
              onPress={item.onPress}
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header} />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
});
