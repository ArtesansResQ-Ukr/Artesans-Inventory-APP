import React from 'react';
import { ProductCamera } from '../../components/camera/ProductCamera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const CameraScreen = ({ navigation }: Props) => {
  const { isNewProduct } = useSelector((state: RootState) => state.ocr);

  const handleCapture = (data: any) => {
    console.log('Captured image data:', data);
    // Navigation is handled inside ProductCamera component
    // based on isNewProduct state from Redux
  };

  const handleText = (text: string) => {
    console.log('Detected OCR text:', text);
  };

  return (
    <ProductCamera
      navigation={navigation}
      onCapture={handleCapture}
      onTextDetected={handleText}
    />
  );
};

export default CameraScreen; 