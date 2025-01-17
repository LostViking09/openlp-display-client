/* global viewportSize, textFit */

const host = "localhost";
const websocket_port = 4317;
const http_port = 336;
const http_api_url = "/api/v2/controller/live-item";
let ws; // WebSocket instance
const slideText0 = document.getElementById('slideText0');
const slideText1 = document.getElementById('slideText1');

var currentSlide = slideText0;
var lastSlide    = slideText1;
var useSecondSlideDiv = false; // selects which div is shown (for transitions)
var currentSlideHTML = "" // stores the current html to check for changes
var screenBlanked = false // true if display is blanked

async function wsConnect() {
    ws = new WebSocket('ws://' + host + ':' + websocket_port);
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
    slideText0.style.height = viewportSize.getHeight() -50 + 'px';
    slideText1.style.width = viewportSize.getWidth() -50 + 'px';
    slideText1.style.height = viewportSize.getHeight() -50 + 'px';
    
    try {
        const response = await fetch('http://' + host + ':' + http_port + http_api_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
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
    }
    textFit(slideText0, {minFontSize:10, multiLine:true, maxFontSize:150});
    textFit(slideText1, {minFontSize:10, multiLine:true, maxFontSize:150});
}

function updateOpacity() {
    currentSlide.style.opacity = screenBlanked ? 0 : 1;
    lastSlide.style.opacity = 0;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchSlideText();
    wsConnect();
    // Update every 100 ms
    setInterval(fetchSlideText, 100);
});
