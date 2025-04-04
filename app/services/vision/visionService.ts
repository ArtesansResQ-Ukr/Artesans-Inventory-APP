import * as FileSystem from 'expo-file-system';
import { GOOGLE_CLOUD_VISION_API_KEY } from '@env';
import axios, { AxiosError } from 'axios';
import { API_URL } from '@env';
import { getToken } from '../auth/tokenService';

/**
 * Process image with Google Vision API to extract text
 */
export const processImageOCR = async (base64Image: string): Promise<string> => {
    try {
        if (!GOOGLE_CLOUD_VISION_API_KEY) {
          throw new Error('Missing Google Cloud Vision API key.');
        }
        
        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
            {
              requests: [
                {
                  image: { content: base64Image },
                  features: [{ type: 'TEXT_DETECTION' }],
                },
              ],
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000,
            }
        );

        const data = response.data;
        const extractedText = data?.responses?.[0]?.textAnnotations?.[0]?.description;
        return extractedText || '';
    } catch (error) {
        console.error('OCR failed:', error);
        return '';
    }
};


/**
 * Send OCR text to backend for processing
 */
export const extractProductInfo = async (ocrText: string): Promise<any | null> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Sending OCR request with token:', token.substring(0, 15) + '...');
    
    const response = await axios.post(
      `${API_URL}/products/extract`, 
      { ocr_text: ocrText },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Backend OCR conversion failed:', axiosError);
    if (axiosError.response) {
      console.error('Response status:', axiosError.response.status);
      console.error('Response data:', axiosError.response.data);
    }
    return null;
  }
};