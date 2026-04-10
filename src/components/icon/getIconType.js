export const getIconType = (type) => {
  switch (type) {
    case 'zocial':
      return require('@expo/vector-icons/Zocial').default;
    case 'octicon':
      return require('@expo/vector-icons/Octicons').default;
    case 'material':
      return require('@expo/vector-icons/MaterialIcons').default;
    case 'material-community':
      return require('@expo/vector-icons/MaterialCommunityIcons').default;
    case 'ionicon':
      return require('@expo/vector-icons/Ionicons').default;
    case 'foundation':
      return require('@expo/vector-icons/Foundation').default;
    case 'evilicon':
      return require('@expo/vector-icons/EvilIcons').default;
    case 'entypo':
      return require('@expo/vector-icons/Entypo').default;
    case 'font-awesome':
      return require('@expo/vector-icons/FontAwesome').default;
    case 'font-awesome-5':
      return require('@expo/vector-icons/FontAwesome5').default;
    case 'simple-line-icon':
      return require('@expo/vector-icons/SimpleLineIcons').default;
    case 'feather':
      return require('@expo/vector-icons/Feather').default;
    case 'ant-design':
      return require('@expo/vector-icons/AntDesign').default;
    case 'fontisto':
      return require('@expo/vector-icons/Fontisto').default;
  }
};
