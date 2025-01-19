const settingsSchema = {
    launchToDisplay: {
      type: 'boolean',
      default: false,
      description: 'Starts the application in display mode, instead of showing the settings',
    },
    windowType: {
      type: 'string',
      enum: ['Normal', 'Borderless', 'Fullscreen'],
      default: 'Normal',
      description: 'Type of window to use: Normal window, Borderless window, or Fullscreen window',
    },
    windowPositionX: {
      type: 'number',
      default: 100,
      description: 'X coordinate of window position on open (only for Normal or Borderless)',
    },
    windowPositionY: {
      type: 'number',
      default: 100,
      description: 'Y coordinate of window position on open (only for Normal or Borderless)',
    },
    windowSizeWidth: {
      type: 'number',
      default: 800,
      description: 'Width of window on open (only for Normal or Borderless)',
    },
    windowSizeHeight: {
      type: 'number',
      default: 600,
      description: 'Height of window on open (only for Normal or Borderless)',
    },
    fontFace: {
      type: 'string',
      default: 'Arial',
      description: 'Font family to use for displaying text',
    },
    alwaysBold: {
      type: 'boolean',
      default: false,
      description: 'Force text to always be displayed in bold weight',
    },
    staticFontSize: {
      type: 'number',
      default: 40,
      description: 'Font size to use when dynamic scaling is disabled',
    },
    dynamicFontScalingEnabled: {
      type: 'boolean',
      default: true,
      description: 'Enable or disable dynamic font scaling',
    },
    dynamicFontScalingMin: {
      type: 'number',
      default: 10,
      description: 'Minimum font size when dynamic scaling is enabled',
    },
    dynamicFontScalingMax: {
      type: 'number',
      default: 24,
      description: 'Maximum font size when dynamic scaling is enabled',
    },
    backgroundColor: {
      type: 'string',
      default: '#000000',
      description: 'Background color of the display window',
    },
    textColor: {
      type: 'string',
      default: '#FFFFFF',
      description: 'Text color for displayed content',
    },
    fadeTime: {
      type: 'number',
      default: 0.2,
      description: 'Duration of fade transitions in seconds',
    },
    serverIP: {
      type: 'string',
      default: 'localhost',
      description: 'IP address of the OpenLP server',
    },
    serverHttpPort: {
      type: 'number',
      default: 336,
      description: 'HTTP port for the OpenLP server',
    },
    serverWebSocketPort: {
      type: 'number',
      default: 4317,
      description: 'WebSocket port for the OpenLP server',
    },
    blankOnConnectionLost: {
      type: 'number',
      default: 0,
      description: 'Blank the screen if connection is lost after specified seconds (0 = never)',
    },
    showConnectionLostMessages: {
      type: 'boolean',
      default: true,
      description: 'Show popup notifications for connection errors',
    },
    showSuccessfulConnectionMessages: {
      type: 'boolean',
      default: true,
      description: 'Show popup notifications for successful connections',
    },
    displayScreen: {
      type: 'number',
      default: 0,
      description: 'Screen number to show the display on (0 = primary screen)',
    },
    lastWindowPositionX: {
      type: 'number',
      default: 100,
      description: 'Internal: Stores the last known X position of the window',
    },
    lastWindowPositionY: {
      type: 'number',
      default: 100,
      description: 'Internal: Stores the last known Y position of the window',
    },
    lastWindowSizeWidth: {
      type: 'number',
      default: 800,
      description: 'Internal: Stores the last known width of the window',
    },
    lastWindowSizeHeight: {
      type: 'number',
      default: 600,
      description: 'Internal: Stores the last known height of the window',
    },
  };
  
  export default settingsSchema;
