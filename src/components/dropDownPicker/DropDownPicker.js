import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import DropDownPickerComponent from 'react-native-dropdown-picker';

import { colors } from '~/styles';
import { Icon } from '../icon';
import { Input } from '../input';
import { Pressable } from '../pressable';

export const DropDownPicker = (props) => {
  const { t } = useTranslation();
  const {
    schema = {
      value: 'value',
      label: 'label',
    },
    onClose,
    value,
    onChangeValue,
    label,
    required,
    errorMessage,
    hasError,
    editable = false,
    placeholder = t('selectAnItem'),
    style,
    data,
    defaultValue,
  } = props;

  const [open, setOpen] = useState(false);

  const handleChange = (item) => {
    onChangeValue?.(item[schema.value]);
    setOpen(false);
  };

  const getLabelValue = () => {
    const itemLabel = data?.find((item) => item[schema.value] === value);
    return itemLabel ? itemLabel[schema.label] : undefined;
  };

  return (
    <View>
      <Input
        rightComponent={<Icon name='arrow-drop-down' size='small' />}
        defaultValue={defaultValue}
        label={label}
        placeholder={placeholder}
        editable={editable}
        required={required}
        hasError={hasError}
        errorMessage={errorMessage}
        value={getLabelValue()}
        allowClear={false}
        onPress={() => {
          setOpen(true);
        }}
        style={style}
      />
      {open && (
        <DropDownPickerComponent
          listMode='MODAL'
          schema={schema}
          open={open}
          value={value}
          items={data}
          setOpen={setOpen}
          searchContainerStyle={styles.searchContainer}
          CloseIconComponent={() => <Icon name='close' />}
          onClose={onClose}
          renderListItem={({ item }) => {
            return (
              <Pressable
                onPress={() => {
                  handleChange(item);
                }}
                style={styles.itemContainer}>
                <Text style={styles.label}>{item[schema.label]}</Text>
                {item[schema.value] === value && <Icon name='checkmark' />}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    height: 40,
    alignItems: 'center',
  },
});
