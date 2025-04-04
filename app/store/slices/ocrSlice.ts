import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OCRState {
  ocrResults: any[];
  productInfo: any;
  imageUri: string | null;
  isNewProduct: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: OCRState = {
  ocrResults: [],
  productInfo: null,
  imageUri: null,
  isNewProduct: true, // Default to adding a new product
  loading: false,
  error: null
};

export const ocrSlice = createSlice({
  name: 'ocr',
  initialState,
  reducers: {
    setOcrResults: (state, action: PayloadAction<{
      ocrResults: any[];
      productInfo: any;
      imageUri: string;
    }>) => {
      state.ocrResults = action.payload.ocrResults;
      state.productInfo = action.payload.productInfo;
      state.imageUri = action.payload.imageUri;
      state.loading = false;
      state.error = null;
    },
    setIsNewProduct: (state, action: PayloadAction<boolean>) => {
      state.isNewProduct = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetOcr: (state) => {
      return initialState;
    }
  }
});

export const { 
  setOcrResults, 
  setIsNewProduct, 
  setLoading, 
  setError, 
  resetOcr 
} = ocrSlice.actions;

export default ocrSlice.reducer; 