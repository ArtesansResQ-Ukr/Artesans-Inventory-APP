import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Camera,CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import * as ImageManipulator from 'expo-image-manipulator';
import { processImageOCR, extractProductInfo } from '../../services/vision/visionService';
import { useDispatch, useSelector } from 'react-redux';
import { setOcrResults, setLoading } from '../../store/slices/ocrSlice';
import { RootState } from '../../store';

//Captures images and prepares them for OCR
//User takes photo with ProductCamera component

interface ProductCameraProps {
  navigation: any;
  onCapture?: (data: any) => void;
  onTextDetected: (text: string) => void;
}

export const ProductCamera = ({ navigation, onTextDetected, onCapture }: ProductCameraProps) => {
  // State for camera permissions
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const dispatch = useDispatch();
  
  // Get state from Redux
  const { loading, isNewProduct } = useSelector((state: RootState) => state.ocr);

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * Takes a picture, processes it with OCR, and navigates to results screen
   */
  const takePicture = async () => {
    if (!hasPermission) {
      alert('No access to camera. Please enable camera permissions.');
      return;
    }
    if (!cameraRef.current) {
        alert('No camera found. Please try again.');
        return;
    }

    if (cameraRef.current) {
      try {
        dispatch(setLoading(true));
        
        // Take picture
        const options = { quality: 0.5, base64: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        
        // Optimize image for processing
        const optimizedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1000 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        
        // Process with Google Cloud Vision
        if (!optimizedImage.base64) {
          throw new Error('Failed to generate base64 image');
        }
        const ocrResults = await processImageOCR(optimizedImage.base64);
        
        // Call the text detected callback with the OCR results
        onTextDetected && onTextDetected(ocrResults);
            
        // Extract product information from OCR results
        const productInfo = await extractProductInfo(ocrResults);
        
        // Store results in Redux
        dispatch(setOcrResults({ 
          ocrResults: [ocrResults], 
          productInfo: productInfo,
          imageUri: optimizedImage.uri 
        }));
        
        // Navigate to appropriate screen based on mode
        if (isNewProduct) {
          navigation.navigate('NewProductReview');
        } else {
          navigation.navigate('ExistingProductMatch');
        }
        
        // Call the capture callback with all the data
        onCapture && onCapture({
          imageUri: optimizedImage.uri,
          ocrResults,
          productInfo
        });
        
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
        dispatch(setLoading(false));
      }
    }
  };

  // Handle permissions not granted yet
  if (hasPermission === null) {
    return <ActivityIndicator />;
  }
  
  // Handle permissions denied
  if (hasPermission === false) {
    return <Text>No access to camera. Please enable camera permissions.</Text>;
  }


  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <IconButton icon="camera" size={32} iconColor="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 15,
  },
}); 