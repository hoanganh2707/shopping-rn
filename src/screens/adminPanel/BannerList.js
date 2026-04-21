import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header, Input, Button, Pressable, Icon, Text } from '~/components';
import { bannerApi } from '~/apis';
import { useTheme } from '~/config/ThemeContext';
import { SCREEN_WIDTH } from '~/constants';

export const BannerList = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  
  const [banners, setBanners] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const res = await bannerApi.getAll();
    if (res?.data) {
      setBanners(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setLoading(true);
    const res = await bannerApi.addBanner(newUrl, banners.length);
    if (res.status === 'success') {
      setNewUrl('');
      await fetchBanners();
    } else {
      Alert.alert('Error', res.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    Alert.alert('Xóa Banner', 'Bạn có chắc muốn xóa banner này không?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const res = await bannerApi.deleteBanner(id);
          if (res.status === 'success') {
            await fetchBanners();
          }
          setLoading(false);
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Icon name="delete" color={colors.error} />
      </Pressable>
    </View>
  );

  return (
    <>
      <Header title={'Quản lý Banner'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.addSection}>
          <Input 
            placeholder="Nhập URL hình ảnh..." 
            value={newUrl} 
            onChangeText={setNewUrl}
            style={styles.input}
          />
          <Button 
            title="Thêm" 
            onPress={handleAdd} 
            loading={loading}
            style={styles.addBtn}
          />
        </View>
        <FlatList
          data={banners}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchBanners}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  addBtn: {
    paddingHorizontal: 20,
  },
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: (SCREEN_WIDTH - 32) * 0.4,
    resizeMode: 'cover',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  }
});
