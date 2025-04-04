import React from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { ProductCamera } from '../../components/camera/ProductCamera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const TestCameraScreen = ({ navigation }: Props) => {
  const handleCapture = (data: any) => {
    console.log('=== Camera Test Results ===');
    console.log('Image URI:', data.imageUri);
    console.log('OCR Results:', data.ocrResults);
    console.log('Product Info:', data.productInfo);
  };

  const handleText = (text: string) => {
    console.log('=== OCR Test Results ===');
    console.log('Detected Text:', text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Camera & OCR Test</Text>
      <Text style={styles.instructions}>
        1. Take a photo of a product label{'\n'}
        2. Check console for OCR results{'\n'}
        3. Verify text detection accuracy
      </Text>
      <ProductCamera 
        navigation={navigation}
        onCapture={handleCapture}
        onTextDetected={handleText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
});

export default TestCameraScreen; 