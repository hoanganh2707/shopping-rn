import { LogBox } from 'react-native';

export const ignoreWarnings = () => {
  return LogBox.ignoreLogs([
    'Require cycle: ',
    'source.uri should not be an empty string', // Component Image
  ]);
};
