import { ProductCamera } from "../../components/camera/ProductCamera";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const CameraScreen = ({ navigation }: Props) => {
  const handleText = (text: string) => {
    console.log('Detected OCR Text:', text);
    // Optionally: send to backend, fill form, etc.
  };

  const handleCapture = (data: any) => {
    console.log('Captured data:', data);
  };
  
  return <ProductCamera navigation={navigation} onCapture={handleCapture} onTextDetected={handleText} />;
};

export default CameraScreen;
  