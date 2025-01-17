import settingsSchema from '../settingsSchema.js';

// Helper to get setting with fallback to schema default
function getSetting(key) {
  const value = window.electron.store.get(key);
  return value !== undefined ? value : settingsSchema[key].default;
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

// Setup handlers for text inputs
function setupTextInputHandlers() {
  ['fontFace', 'serverIP', 'serverHttpPort', 'serverWebSocketPort'].forEach(key => {
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
   'showSuccessfulConnectionMessages'].forEach(key => {
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

// Setup handler for starting main window
function setupStartMainWindowButton() {
  const startMainWindowButton = document.getElementById('startDisplay');
  if (startMainWindowButton) {
    startMainWindowButton.addEventListener('click', () => {
      window.electron.window.main.start();
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
     'showSuccessfulConnectionMessages'].forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.checked = getSetting(key);
      }
    });

    // Setup all event handlers
    setupButtonGroupHandlers();
    setupNumericInputHandlers();
    setupTextInputHandlers();
    setupColorInputHandlers();
    setupCheckboxHandlers();
    setupFactoryResetButton();
    setupExitButton();
    setupStartMainWindowButton();
  });
});
