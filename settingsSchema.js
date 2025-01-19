const settingsSchema = {
    launchToDisplay: {
      type: 'boolean',
      default: false,
    },
    windowType: {
      type: 'string',
      enum: ['Normal', 'Borderless', 'Fullscreen'],
      default: 'Normal',
    },
    windowPositionX: {
      type: 'number',
      default: 100,
    },
    windowPositionY: {
      type: 'number',
      default: 100,
    },
    windowSizeWidth: {
      type: 'number',
      default: 800,
    },
    windowSizeHeight: {
      type: 'number',
      default: 600,
    },
    fontFace: {
      type: 'string',
      default: 'Arial',
    },
    alwaysBold: {
      type: 'boolean',
      default: false,
    },
    staticFontSize: {
      type: 'number',
      default: 40,
    },
    dynamicFontScalingEnabled: {
      type: 'boolean',
      default: true,
    },
    dynamicFontScalingMin: {
      type: 'number',
      default: 10,
    },
    dynamicFontScalingMax: {
      type: 'number',
      default: 24,
    },
    backgroundColor: {
      type: 'string',
      default: '#000000',
    },
    textColor: {
      type: 'string',
      default: '#FFFFFF',
    },
    fadeTime: {
      type: 'number',
      default: 0.2,
    },
    serverIP: {
      type: 'string',
      default: 'localhost',
    },
    serverHttpPort: {
      type: 'number',
      default: 336,
    },
    serverWebSocketPort: {
      type: 'number',
      default: 4317,
    },
    blankOnConnectionLost: {
      type: 'number',
      default: 0,
    },
    showConnectionLostMessages: {
      type: 'boolean',
      default: true,
    },
    showSuccessfulConnectionMessages: {
      type: 'boolean',
      default: true,
    },
  };
  
  export default settingsSchema;
  