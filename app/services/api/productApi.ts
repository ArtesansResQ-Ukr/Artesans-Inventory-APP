import apiClient from './apiClient';
import { API_URL } from '@env';
import axios, { AxiosError } from 'axios';
import { Alert } from 'react-native';
// Define types
interface Product {
  uuid?: string;
  name: string;
  category: string;
  expiration_date: string;
  quantity: number;
  comments?: string;
  ocr_text?: string;
}


/**
 * Sends OCR text to backend to convert to product structure
 * 
 * @param ocrText - The extracted text from OCR
 * @returns Promise with structured product data
 */
export const convertOcrToProduct = async (ocrText: string): Promise<any> => {
  try {
    const safeOcrText = ocrText.replace(/\n/g, ' ').trim();
    console.log('OCR text to send:', safeOcrText, typeof safeOcrText);

    const response = await apiClient.post(`/products/extract`, { 
      ocr_text: safeOcrText
    });
    return response.data.extracted_product;
  } catch (error) {
    console.error('Failed to convert OCR to product:', error);
    throw error;
  }
};

/**
 * Sends OCR text to backend and gets matching products
 * 
 * @param ocrText - The extracted text from OCR
 * @returns Promise with matched products
 */

export const getProductMatches = async (scannedProduct: Product) => {
  try {
    console.log('scannedProduct:', scannedProduct);
    const response = await apiClient.post(`/products/match`, scannedProduct);
    console.log('response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get product matches:', error);
    throw error;
  }
};

export const getProductMatchesGlobal = async (scannedProduct: Product) => {
  try {
    console.log('scannedProduct:', scannedProduct);
    const response = await apiClient.post(`/products/match-global`, scannedProduct);
    console.log('response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get product matches globally:', error);
    throw error;
  }
};

/**
 * Creates a new product in the backend
 * 
 * @param product - The product to create
 * @returns Promise with created product
 */
export const createProduct = async (product: Product) => {
  try {
    const response = await apiClient.post(`/products/new`, product);
    return response.data.new_product;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

/**
 * Select a product from matched options
 * 
 * @param extractedProduct - The product extracted from OCR
 * @param selectedProductId - ID of the selected product (optional)
 * @returns Promise with selected product
 */
export const selectProduct = async (extractedProduct: Product, selectedProductId?: string) => {
  try {
    const response = await apiClient.post(`/products/select`, {
      extracted_product: extractedProduct,
      selected_product_id: selectedProductId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to select product:', error);
    throw error;
  }
};

/**
 * Increases a product's quantity
 * 
 * @param uuid - The product UUID
 * @param quantity - The quantity to add
 * @returns Promise with updated product
 */
export const increaseProductQuantity = async (uuid: string, quantity: number) => {
  try {
    const response = await apiClient.post(`/products/${uuid}/increase`, {
      uuid,
      quantity
    });
    return response.data.updated_product;
  } catch (error) {
    console.error('Failed to increase product quantity:', error);
    throw error;
  }
};

/**
 * Decreases a product's quantity
 * 
 * @param uuid - The product UUID
 * @param quantity - The quantity to remove
 * @returns Promise with updated product
 */
export const decreaseProductQuantity = async (uuid: string, quantity: number) => {
  try {
    const response = await apiClient.post(`/products/${uuid}/decrease`, {
      uuid,
      quantity
    });
    return response.data.updated_product;
  } catch (error) {
    console.error('Failed to decrease product quantity:', error);
    throw error;
  }
}; 

export const deleteProduct = async (uuid: string) => {
  try {
    const response = await apiClient.post(`/products/${uuid}/delete`, {
      uuid
    });
    return response.data.product_user_history_action;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
}

/**
 * Fetches all products with optional filters
 * 
 * @param productUuid - Optional product UUID to filter by
 * @returns Promise with products list
 */
export const getProducts = async (productUuid?: string) => {
  try {
    const params: Record<string, string> = {};
    if (productUuid) params.product_uuid = productUuid;
    
    const response = await apiClient.get('/products/view', { params });
    return response.data.products;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      console.error('Failed to fetch products:', error);
      const backend_message = error.response.data.detail || 'An unknown error occurred';
      Alert.alert('Error', backend_message);
      throw backend_message;
    } else {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};

export const getProductQuantityInAllGroups = async (productUuid: string) => {
  try {
    const response = await apiClient.get(`/products/${productUuid}/view-quantity-groups`);
    return response.data.product_groups_links;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      console.error('Failed to fetch products:', error);
      const backend_message = error.response.data.detail || 'An unknown error occurred';
      Alert.alert('Error', backend_message);
      throw backend_message;
    } else {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};
export const getProductQuantityInOneGroup = async (productUuid: string, groupUuid: string) => {
  try {
    const response = await apiClient.get(`/products/${productUuid}/view-quantity-groups?group_uuid=${groupUuid}`);
    return response.data.product_groups_links;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      console.error('Failed to fetch products:', error);
      const backend_message = error.response.data.detail || 'An unknown error occurred';
      Alert.alert('Error', backend_message);
      throw backend_message;
    } else {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};


/**
 * Fetches product user history with optional user filter
 * @param subjectUuid - Optional user UUID to filter by
 * @returns Promise with product user history
 */
export const getProductUserHistory = async (subjectUuid?: string) => {
  try {
    const params: Record<string, string> = {};
    if (subjectUuid) params.subject_uuid = subjectUuid;
    
    const response = await apiClient.get('/products/history', { params });
    return response.data.product_user_history;
  } catch (error) {
    console.error('Failed to fetch product history:', error);
    throw error;
  }
};

export const getSpecificProductHistory = async (productUuid: string) => {
  try {
    const response = await apiClient.get(`/products/${productUuid}/view-history`);
    return response.data.product_history;
  } catch (error){
    console.error('Failed to fetch this product history', error)
    throw error
  }
}
