function getSetting(key) {
  return window.electron.store.get(key);
}

// Helper to set active state for button groups
function setActiveButton(activeId, buttonIds) {
  buttonIds.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.toggle('is-primary', button.id === activeId);
    }
  });
}

// Wait for electron store to be available then load settings
function waitForElectron(callback, maxAttempts = 50) {
  let attempts = 0;
  const check = () => {
    attempts++;
    if (window.electron && window.electron.store) {
      callback();
    } else if (attempts < maxAttempts) {
      setTimeout(check, 100);
    } else {
      console.error('Electron store not available after maximum attempts');
    }
  };
  check();
}

// Load settings when the page loads and electron is available
// Setup handlers for button groups
function setupButtonGroupHandlers() {
  // Launch mode buttons
  const launchButtons = ['launchToDisplay_settings', 'launchToDisplay_display'];
  launchButtons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        setActiveButton(id, launchButtons);
        window.electron.store.set('launchToDisplay', id === 'launchToDisplay_display');
      });
    }
  });

  // Window type buttons
  const windowTypeButtons = ['windowType_normal', 'windowType_borderless', 'windowType_fullscreen'];
  windowTypeButtons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        setActiveButton(id, windowTypeButtons);
        // Convert id to proper case (e.g., 'windowType_normal' -> 'Normal')
        const type = id.replace('windowType_', '');
        window.electron.store.set('windowType', type.charAt(0).toUpperCase() + type.slice(1));
      });
    }
  });

  // Image handling buttons
  const imageHandlingButtons = ['imageHandling_blank', 'imageHandling_screenshot'];
  imageHandlingButtons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        setActiveButton(id, imageHandlingButtons);
        // Convert id to proper case (e.g., 'windowType_normal' -> 'Normal')
        const type = id.replace('imageHandling_', '');
        window.electron.store.set('imageHandling', type.charAt(0).toUpperCase() + type.slice(1));
      });
    }
  });

}

// Setup handler for display screen selector
function setupDisplayScreenHandler() {
  const select = document.getElementById('displayScreen');
  if (select) {
    // Populate options
    const displays = window.electron.displays.getAll();
    displays.forEach(display => {
      const option = document.createElement('option');
      option.value = display.id;
      option.textContent = `${display.id + 1}. ${display.name}${display.isPrimary ? ' (Primary)' : ''}`;
      select.appendChild(option);
    });

    // Set current value
    select.value = getSetting('displayScreen');

    // Handle changes
    select.addEventListener('change', () => {
      window.electron.store.set('displayScreen', parseInt(select.value, 10));
    });
  }
}

// Setup handlers for numeric inputs
function setupNumericInputHandlers() {
  ['windowPositionX', 'windowPositionY', 'windowSizeWidth', 'windowSizeHeight',
   'staticFontSize', 'dynamicFontScalingMin', 'dynamicFontScalingMax',
   'fadeTime', 'blankOnConnectionLost'].forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.addEventListener('change', () => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
          window.electron.store.set(key, value);
        }
      });
    }
  });
}

// Setup font face selector
async function setupFontFaceHandler() {
  const fontSelect = document.getElementById('fontFace');
  if (fontSelect) {
    try {
      // Get system fonts
      const fonts = await window.electron.getFonts();
      
      // Add fonts to select
      fonts.forEach(font => {
        const option = document.createElement('option');
        // Remove quotes if present
        const fontName = font.replace(/^"|"$/g, '');
        option.value = fontName;
        option.textContent = fontName;
        option.style.fontFamily = fontName;
        fontSelect.appendChild(option);
      });

      // Set current value
      fontSelect.value = getSetting('fontFace');

      // Update select element's font style
      const updateFontSelectStyle = () => {
        fontSelect.style.fontFamily = fontSelect.value;
      };

      // Set initial font style
      updateFontSelectStyle();

      // Handle changes
      fontSelect.addEventListener('change', () => {
        window.electron.store.set('fontFace', fontSelect.value);
        updateFontSelectStyle();
      });
    } catch (error) {
      console.error('Error loading system fonts:', error);
    }
  }
}

// Setup handlers for text inputs
function setupTextInputHandlers() {
  ['serverIP', 'serverHttpPort', 'serverWebSocketPort'].forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.addEventListener('change', () => {
        window.electron.store.set(key, input.value);
      });
    }
  });
}

// Setup handlers for color inputs
function setupColorInputHandlers() {
  ['backgroundColor', 'textColor'].forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.addEventListener('change', () => {
        window.electron.store.set(key, input.value);
      });
    }
  });
}

// Setup handlers for checkboxes
function setupCheckboxHandlers() {
  ['dynamicFontScalingEnabled', 'showConnectionLostMessages',
   'showSuccessfulConnectionMessages', 'alwaysBold'].forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.addEventListener('change', () => {
        window.electron.store.set(key, input.checked);
      });
    }
  });
}

// Setup handler for factory reset button
function setupFactoryResetButton() {
  const factoryResetButton = document.getElementById('factoryReset');
  if (factoryResetButton) {
    factoryResetButton.addEventListener('click', () => {
      window.electron.store.clear();
      location.reload();
    });
  }
}

// Setup handler for exit button
function setupExitButton() {
  const exitButton = document.getElementById('exit');
  if (exitButton) {
    exitButton.addEventListener('click', () => {
      window.electron.window.settings.close();
    });
  }
}

// Setup handlers for "Get current" buttons
function setupGetCurrentButtons() {
  const getCurrentPositionButton = document.getElementById('getCurrentPosition');
  const getCurrentSizeButton = document.getElementById('getCurrentSize');

  if (getCurrentPositionButton && getCurrentSizeButton) {
    getCurrentPositionButton.addEventListener('click', () => {
      const lastX = getSetting('lastWindowPositionX');
      const lastY = getSetting('lastWindowPositionY');
      const posX = document.getElementById('windowPositionX');
      const posY = document.getElementById('windowPositionY');
      if (posX && posY) {
        posX.value = lastX;
        posY.value = lastY;
        window.electron.store.set('windowPositionX', lastX);
        window.electron.store.set('windowPositionY', lastY);
      }
    });

    getCurrentSizeButton.addEventListener('click', () => {
      const lastWidth = getSetting('lastWindowSizeWidth');
      const lastHeight = getSetting('lastWindowSizeHeight');
      const width = document.getElementById('windowSizeWidth');
      const height = document.getElementById('windowSizeHeight');
      if (width && height) {
        width.value = lastWidth;
        height.value = lastHeight;
        window.electron.store.set('windowSizeWidth', lastWidth);
        window.electron.store.set('windowSizeHeight', lastHeight);
      }
    });
  }
}

// Setup handler for starting display window
function setupStartDisplayWindowButton() {
  const startDisplayButton = document.getElementById('startDisplay');
  if (startDisplayButton) {
    startDisplayButton.addEventListener('click', () => {
      window.electron.window.display.start();
      window.electron.window.settings.close();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForElectron(() => {
    // Load launch mode setting
    const launchToDisplay = getSetting('launchToDisplay');
    setActiveButton(
      launchToDisplay ? 'launchToDisplay_display' : 'launchToDisplay_settings',
      ['launchToDisplay_settings', 'launchToDisplay_display']
    );

    // Load window type setting
    const windowType = getSetting('windowType').toLowerCase();
    setActiveButton(
      `windowType_${windowType}`,
      ['windowType_normal', 'windowType_borderless', 'windowType_fullscreen']
    );

    // Load image handling setting
    const imageHandling = getSetting('imageHandling').toLowerCase();
    setActiveButton(
      `imageHandling_${imageHandling}`,
      ['imageHandling_blank', 'imageHandling_screenshot']
    );

    // Load numeric inputs
    ['windowPositionX', 'windowPositionY', 'windowSizeWidth', 'windowSizeHeight',
     'staticFontSize', 'dynamicFontScalingMin', 'dynamicFontScalingMax',
     'fadeTime', 'blankOnConnectionLost'].forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = getSetting(key);
      }
    });

    // Load text inputs
    ['fontFace', 'serverIP', 'serverHttpPort', 'serverWebSocketPort'].forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = getSetting(key);
      }
    });

    // Load color inputs
    ['backgroundColor', 'textColor'].forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = getSetting(key);
      }
    });

    // Load checkboxes
    ['dynamicFontScalingEnabled', 'showConnectionLostMessages',
     'showSuccessfulConnectionMessages', 'alwaysBold'].forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.checked = getSetting(key);
      }
    });

    // Setup all event handlers
    setupButtonGroupHandlers();
    setupDisplayScreenHandler();
    setupNumericInputHandlers();
    setupTextInputHandlers();
    setupFontFaceHandler();
    setupColorInputHandlers();
    setupCheckboxHandlers();
    setupFactoryResetButton();
    setupExitButton();
    setupStartDisplayWindowButton();
    setupGetCurrentButtons();
  });
});
