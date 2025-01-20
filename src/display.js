/* global viewportSize, textFit */

const serverIP = window.electron.store.get('serverIP');
const serverWebSocketPort = window.electron.store.get('serverWebSocketPort');
const serverHttpPort = window.electron.store.get('serverHttpPort');
const blankOnConnectionLost = window.electron.store.get('blankOnConnectionLost');
const http_api_url = "/api/v2/controller/live-item";
let ws; // WebSocket instance
let connectionLostTimer = null; // Timer for connection lost blanking
let wsConnected = false; // Track WebSocket connection status
let httpConnected = false; // Track HTTP connection status
const slideText0 = document.getElementById('slideText0');
const slideText1 = document.getElementById('slideText1');

const dynamicFontScalingMin = window.electron.store.get('dynamicFontScalingMin');
const dynamicFontScalingMax = window.electron.store.get('dynamicFontScalingMax');

var currentSlide = slideText0;
var lastSlide    = slideText1;
var useSecondSlideDiv = false; // selects which div is shown (for transitions)
var currentSlideHTML = "" // stores the current html to check for changes
var screenBlanked = false // true if display is blanked

// Init functions

function setStyling(){
    document.body.style.fontFamily = window.electron.store.get('fontFace');
    document.body.style.fontWeight = window.electron.store.get('alwaysBold') ? 'bold' : 'normal';
    if (!window.electron.store.get('dynamicFontScalingEnabled')) {
        document.body.style.fontSize = window.electron.store.get('staticFontSize') + 'px';
    }
    document.body.style.backgroundColor = window.electron.store.get('backgroundColor');
    document.body.style.color = window.electron.store.get('textColor');
    const fadeTime = window.electron.store.get('fadeTime') + 's';
    slideText0.style.transition = `opacity ${fadeTime}`;
    slideText1.style.transition = `opacity ${fadeTime}`;
}

function startConnectionLostTimer() {
    if (blankOnConnectionLost > 0 && !connectionLostTimer) {
        connectionLostTimer = setTimeout(() => {
            screenBlanked = true;
            updateOpacity();
        }, blankOnConnectionLost * 1000);
    }
}

function clearConnectionLostTimer() {
    if (connectionLostTimer) {
        clearTimeout(connectionLostTimer);
        connectionLostTimer = null;
    }
    // If both connections are working and screen was blanked, unblank it
    if (wsConnected && httpConnected && screenBlanked && !connectionLostTimer) {
        screenBlanked = false;
        updateOpacity();
        fetchSlideText();
    }
}

async function wsConnect() {
    ws = new WebSocket('ws://' + serverIP + ':' + serverWebSocketPort);
    
    ws.onopen = () => {
        wsConnected = true;
        if (httpConnected) {
            clearConnectionLostTimer();
        }
    };

    ws.onclose = () => {
        wsConnected = false;
        startConnectionLostTimer();
        // Try to reconnect
        setTimeout(wsConnect, 1000);
    };

    ws.onmessage = (event) => {
        const reader = new FileReader();
        reader.onload = () => {
            const state = JSON.parse(reader.result.toString()).results;
            if (screenBlanked != state.blank){
                if (!state.blank) {
                    slideText0.innerHTML = "";
                    slideText1.innerHTML="";
                    currentSlideHTML="";
                    screenBlanked = state.blank;
                    fetchSlideText();
                } else { 
                    screenBlanked = state.blank;
                    updateOpacity(); 
                }
            }
        };
        reader.readAsText(event.data);
    }
}

async function fetchSlideText() {
    currentSlide =  useSecondSlideDiv ? slideText1 : slideText0;
    lastSlide    = !useSecondSlideDiv ? slideText1 : slideText0;
    slideText0.style.width = viewportSize.getWidth() -50 + 'px';

    let wasHttpConnected = httpConnected;
    slideText0.style.height = viewportSize.getHeight() -50 + 'px';
    slideText1.style.width = viewportSize.getWidth() -50 + 'px';
    slideText1.style.height = viewportSize.getHeight() -50 + 'px';
    
    try {
        const response = await fetch('http://' + serverIP + ':' + serverHttpPort + http_api_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // HTTP connection successful
        httpConnected = true;
        if (!wasHttpConnected && wsConnected) {
            clearConnectionLostTimer();
        }
        
        // Check if we have slides and the first slide has text
        if (data.slides && data.slides.length > 0 && data.slides[0].text) {
            let slideHTML = data.slides[0].html;
            slideHTML = '<p>' + slideHTML.replaceAll('<br>','<p>');
            if (currentSlideHTML != slideHTML){
                console.log('difff');
                currentSlide.innerHTML = slideHTML;
                currentSlideHTML = slideHTML;
                updateOpacity();
                useSecondSlideDiv = !useSecondSlideDiv; // switch which DIV is in use
            }
        } else {
            throw new Error('No slide text data');
        }
    } catch (error) {
        console.log(error);
        httpConnected = false;
        if (wasHttpConnected) {
            startConnectionLostTimer();
        }
    }

    textFit(slideText0, {minFontSize: dynamicFontScalingMin, maxFontSize: dynamicFontScalingMax, multiLine: true});
    textFit(slideText1, {minFontSize: dynamicFontScalingMin, maxFontSize: dynamicFontScalingMax, multiLine: true});
}

function updateOpacity() {
    if (screenBlanked) {
        currentSlide.style.opacity = 0;
        lastSlide.style.opacity = 0;
    } else {
        currentSlide.style.opacity = 1;
        lastSlide.style.opacity = 0;
    }
}

// Cursor hiding functionality
let cursorTimeout;
const CURSOR_HIDE_DELAY = 3000; // 3 seconds

function showCursor() {
    document.body.classList.remove('cursor-hidden');
}

function hideCursor() {
    document.body.classList.add('cursor-hidden');
}

function resetCursorTimer() {
    if (document.hasFocus()) {
        showCursor();
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(hideCursor, CURSOR_HIDE_DELAY);
    } else {
        hideCursor();
    }
}

// Initialize styling
setStyling();

// Handle mouse movement
document.addEventListener('mousemove', resetCursorTimer);

// Handle window focus events
window.addEventListener('focus', resetCursorTimer);
window.addEventListener('blur', hideCursor);

// Initialize cursor timer
resetCursorTimer();

// Handle keyboard events
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        // Close display window on ESC
        window.electron.window.display.close();
    } else if (event.key === 'S' || event.key === 's' || event.key === 'P' || event.key === 'p') {
        // Close display window and open settings on S or P
        window.electron.window.settings.start();
        // console.log('Settings opened');
        window.electron.window.display.close();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchSlideText();
    wsConnect();
    // Update every 100 ms
    setInterval(fetchSlideText, 100);
});
