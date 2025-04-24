const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  
  
  // Customize the config before returning it.
  // Add a resolver for react-native-web modules

  if (!config.resolve) {
    config.resolve = {};
  }

  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  
  // Add aliases for react-native-web modules
  config.resolve.alias['react-native'] = 'react-native-web';
  
  // Add aliases for all common react-native-web exports
  const commonExports = [
    'Text',
    'View',
    'ScrollView',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'TextInput',
    'Platform',
    'I18nManager',
    'StyleSheet',
    'Animated',
    'Easing',
    'Image',
    'Modal',
    'ActivityIndicator',
    'FlatList',
    'SectionList',
    'KeyboardAvoidingView',
    'Linking',
    'Dimensions',
    'AppState',
    'Appearance',
    'BackHandler',
    'Clipboard',
    'DeviceInfo',
    'Keyboard',
    'LayoutAnimation',
    'NativeEventEmitter',
    'NativeModules',
    'PanResponder',
    'PixelRatio',
    'StatusBar',
    'Vibration',
    'Alert',
    'ToastAndroid',
    'ActionSheetIOS',
    'Share',
    'NetInfo',
    'WebView',
    'RefreshControl',
    'SafeAreaView',
    'Switch',
    'Picker',
    'Slider',
    'CheckBox',
    'Radio',
    'ProgressBar',
    'SegmentedControl',
    'TabBarIOS',
    'ToolbarAndroid',
    'ViewPagerAndroid',
    'DrawerLayoutAndroid',
    'MaskedViewIOS',
    'DatePickerIOS',
    'TimePickerAndroid',
    'DatePickerAndroid',
    'StatusBarIOS',
    'ActionSheetIOS',
    'AdSupportIOS',
    'AlertIOS',
    'Appearance',
    'AsyncStorage',
    'CameraRoll',
    'Clipboard',
    'DatePickerAndroid',
    'DeviceInfo',
    'Dimensions',
    'Easing',
    'ImagePickerIOS',
    'InteractionManager',
    'Keyboard',
    'LayoutAnimation',
    'Linking',
    'NetInfo',
    'PanResponder',
    'PermissionsAndroid',
    'PixelRatio',
    'Platform',
    'PushNotificationIOS',
    'Settings',
    'Share',
    'StatusBar',
    'StyleSheet',
    'TextInput',
    'ToastAndroid',
    'TouchableHighlight',
    'TouchableNativeFeedback',
    'TouchableOpacity',
    'TouchableWithoutFeedback',
    'Vibration',
    'View',
    'ViewPagerAndroid',
    'WebView',
  ];

  commonExports.forEach(exportName => {
    config.resolve.alias[`react-native-web/dist/exports/${exportName}`] = path.resolve(
      __dirname,
      `node_modules/react-native-web/dist/exports/${exportName}/index.js`
    );
  });

  if (!config.devServer) {
    config.devServer = {};
  }

  config.devServer.port = 8000;

  return config;
}; 




