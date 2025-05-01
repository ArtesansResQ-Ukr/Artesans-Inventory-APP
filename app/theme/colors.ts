// Theme colors for Inventory APP

export const colors = {
  primary: '#004C9B',     // Deep blue
  secondary: '#0693e3',   // Bright blue
  background: '#F4F4F4',  // Light gray
  white: '#FFFFFF',       // White
  black: '#020203',       // Almost black
  gray: '#5A5C64',        // Medium gray
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Gradients (for use with LinearGradient)
  blueGradient: {
    colors: ['rgb(2,3,129)', 'rgb(40,116,252)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    angle: 135,
  },
  purpleBlueGradient: {
    colors: ['rgba(6,147,227,1)', 'rgb(155,81,224)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    angle: 135,
  },
};

// Color variations for different component states
export const colorVariations = {
  primaryLight: '#1a5fad',
  primaryDark: '#003a7a',
  secondaryLight: '#3ba9e9',
  secondaryDark: '#0578b9',
  backgroundDarker: '#e0e0e0',
};

export const textColors = {
  primary: '#020203',     // Almost black for primary text
  secondary: '#5A5C64',   // Medium gray for secondary text
  inverse: '#FFFFFF',     // White text (on dark backgrounds)
  disabled: '#9e9e9e',    // Light gray for disabled text
  link: '#0693e3',   
  error: '#F44336',
};

export default {
  colors,
  colorVariations,
  textColors,
}; 