import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { Header, Icon, Pressable, Text, Button, Input } from '~/components';
import { selectAddresses, selectDefaultAddressId, addressActions } from '~/redux';
import { useTheme } from '~/config/ThemeContext';

export const AddressBook = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const addresses = useSelector(selectAddresses);
  const defaultAddressId = useSelector(selectDefaultAddressId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [addressText, setAddressText] = useState('');

  const resetForm = () => {
    setLabel('');
    setFullname('');
    setPhone('');
    setAddressText('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!fullname.trim() || !phone.trim() || !addressText.trim()) {
      Alert.alert('', t('required') || 'Required');
      return;
    }

    if (editingId) {
      dispatch(addressActions.editAddress({
        id: editingId,
        label: label.trim() || 'Home',
        fullname: fullname.trim(),
        phone: phone.trim(),
        address: addressText.trim(),
      }));
    } else {
      dispatch(addressActions.addAddress({
        label: label.trim() || 'Home',
        fullname: fullname.trim(),
        phone: phone.trim(),
        address: addressText.trim(),
      }));
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setLabel(item.label || '');
    setFullname(item.fullname || '');
    setPhone(item.phone || '');
    setAddressText(item.address || '');
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert('', t('deleteMessage') || 'Are you sure?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => dispatch(addressActions.deleteAddress(id)),
      },
    ]);
  };

  const handleSetDefault = (id) => {
    dispatch(addressActions.setDefaultAddress(id));
  };

  const styles = createStyles(colors);

  const renderAddress = ({ item }) => (
    <View style={[styles.card, item.id === defaultAddressId && styles.cardDefault]}>
      <View style={styles.cardHeader}>
        <View style={styles.labelRow}>
          <View style={[styles.labelBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.labelText, { color: colors.primary }]}>
              {item.label || 'Home'}
            </Text>
          </View>
          {item.id === defaultAddressId && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.defaultText, { color: colors.success || '#4caf50' }]}>
                {t('default') || 'Mặc định'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => handleEdit(item)} style={styles.actionBtn}>
            <Icon name="edit" size="xSmall" color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Icon name="delete" size="xSmall" color={colors.error} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.primaryText }]}>{item.fullname}</Text>
      <Text style={[styles.phone, { color: colors.secondaryText }]}>{item.phone}</Text>
      <Text style={[styles.address, { color: colors.secondaryText }]}>{item.address}</Text>
      {item.id !== defaultAddressId && (
        <Pressable onPress={() => handleSetDefault(item.id)} style={styles.setDefaultBtn}>
          <Text style={{ color: colors.primary }}>{t('setAsDefault') || 'Đặt làm mặc định'}</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <>
      <Header title={t('addressBook') || 'Sổ địa chỉ'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showForm ? (
          <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
            <Text variant="titleMedium" style={[styles.formTitle, { color: colors.primaryText }]}>
              {editingId ? (t('editAddress') || 'Sửa địa chỉ') : (t('addNewAddress') || 'Thêm địa chỉ mới')}
            </Text>
            <Input
              label={t('addressLabel') || 'Nhãn (VD: Nhà riêng, Công ty)'}
              value={label}
              onChangeText={setLabel}
              placeholder="Nhà riêng"
              style={styles.input}
            />
            <Input
              label={t('fullname')}
              value={fullname}
              onChangeText={setFullname}
              placeholder={t('pleaseInput')}
              style={styles.input}
              required
            />
            <Input
              label={t('phoneNumber')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('pleaseInput')}
              keyboardType="phone-pad"
              style={styles.input}
              required
            />
            <Input
              label={t('address')}
              value={addressText}
              onChangeText={setAddressText}
              placeholder={t('pleaseInput')}
              multiline
              numberOfLines={3}
              style={styles.input}
              required
            />
            <View style={styles.formButtons}>
              <Button
                title={t('cancel')}
                onPress={resetForm}
                variant="outline"
                style={styles.formBtn}
              />
              <Button
                title={t('save')}
                onPress={handleSave}
                style={styles.formBtn}
              />
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={addresses}
              renderItem={renderAddress}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={{ color: colors.secondaryText }}>
                    {t('noAddresses') || 'Chưa có địa chỉ nào'}
                  </Text>
                </View>
              }
            />
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <Button
                title={t('addNewAddress') || 'Thêm địa chỉ mới'}
                onPress={() => setShowForm(true)}
                block
              />
            </View>
          </>
        )}
      </View>
    </>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDefault: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: { flexDirection: 'row', gap: 8 },
  labelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: { fontSize: 12, fontWeight: '600' },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  phone: { fontSize: 14, marginBottom: 4 },
  address: { fontSize: 14, lineHeight: 20 },
  setDefaultBtn: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formTitle: { marginBottom: 16 },
  input: { marginBottom: 12 },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formBtn: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default AddressBook;
