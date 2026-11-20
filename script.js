// Global variables
let canvas, ctx;
let image = null;
let isDrawing = false;
let startX, startY, endX, endY;
let boundingBox = null;
let model = null;
let isModelLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('imageCanvas');
    ctx = canvas.getContext('2d');
    
    // Set up image input handler
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    
    // Set up canvas event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Load TensorFlow.js model
    loadModel();
});

// Load COCO-SSD model
async function loadModel() {
    try {
        isModelLoading = true;
        document.getElementById('modelLoading').style.display = 'block';
        console.log('Loading COCO-SSD model...');
        
        model = await cocoSsd.load();
        
        console.log('Model loaded successfully!');
        isModelLoading = false;
        document.getElementById('modelLoading').style.display = 'none';
        
        // Show success message briefly
        const instructions = document.querySelector('.instructions');
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #c3e6cb;';
        successMsg.innerHTML = '✅ AI model loaded successfully! You can now upload images and detect objects.';
        instructions.parentNode.insertBefore(successMsg, instructions.nextSibling);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error loading model:', error);
        isModelLoading = false;
        document.getElementById('modelLoading').style.display = 'none';
        
        // Show error message
        const instructions = document.querySelector('.instructions');
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #f5c6cb;';
        errorMsg.innerHTML = '❌ Failed to load AI model. Please refresh the page and try again.';
        instructions.parentNode.insertBefore(errorMsg, instructions.nextSibling);
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        image = new Image();
        image.onload = function() {
            setupCanvas();
            drawImage();
            document.getElementById('canvasContainer').style.display = 'block';
            document.getElementById('clearBtn').disabled = false;
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Setup canvas dimensions
function setupCanvas() {
    const maxWidth = 800;
    const maxHeight = 600;
    
    let { width, height } = image;
    
    // Scale image to fit within max dimensions while maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// Draw the image on canvas
function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Redraw bounding box if it exists
    if (boundingBox) {
        drawBoundingBox(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    }
}

// Start drawing bounding box
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    endX = startX;
    endY = startY;
    boundingBox = null;
}

// Draw bounding box while dragging
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;
    
    // Redraw image and current bounding box
    drawImage();
    drawBoundingBox(startX, startY, endX - startX, endY - startY);
}

// Stop drawing bounding box
function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Discard boxes too small to analyze
    if (width <= 10 || height <= 10) {
        clearBoundingBox();
        return;
    }
    
    boundingBox = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: width,
        height: height
    };
    document.getElementById('countBtn').disabled = false;
}

// Draw bounding box on canvas
function drawBoundingBox(x, y, width, height) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    
    // Add corner handles
    ctx.fillStyle = '#ff0000';
    ctx.setLineDash([]);
    const handleSize = 6;
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
}

// Clear bounding box
function clearBoundingBox() {
    boundingBox = null;
    drawImage();
    document.getElementById('countBtn').disabled = true;
    document.getElementById('results').style.display = 'none';
}

// Count objects using computer vision
async function countObjects() {
    if (!image || !boundingBox) {
        alert('Please upload an image and draw a bounding box first.');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    try {
        // Extract the region of interest from the canvas
        const imageData = getImageDataFromBoundingBox();
        
        // Simulate computer vision analysis (replace with actual API call)
        const results = await simulateObjectDetection(imageData);
        
        // Display results
        displayResults(results);
        showResultPopup(results);
        
    } catch (error) {
        console.error('Error during object detection:', error);
        alert('Error occurred during object detection. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Extract image data from bounding box area
function getImageDataFromBoundingBox() {
    // Create a temporary canvas for the cropped region
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = boundingBox.width;
    tempCanvas.height = boundingBox.height;
    
    // Draw the cropped region
    tempCtx.drawImage(
        canvas,
        boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
        0, 0, boundingBox.width, boundingBox.height
    );
    
    return tempCanvas.toDataURL('image/jpeg', 0.8);
}

// Real object detection using TensorFlow.js COCO-SSD
async function simulateObjectDetection(imageData) {
    const startTime = performance.now();
    
    if (!model) {
        if (isModelLoading) {
            throw new Error('Model is still loading. Please wait a moment and try again.');
        } else {
            throw new Error('Model failed to load. Please refresh the page.');
        }
    }
    
    try {
        // Create image element from the cropped data
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData;
        });
        
        // Run object detection on the image
        const predictions = await model.detect(img);
        
        // Filter and count cars and people
        const carClasses = ['car', 'truck', 'bus', 'motorcycle', 'bicycle'];
        const personClasses = ['person'];
        
        let cars = 0;
        let people = 0;
        let totalConfidence = 0;
        let detectionCount = 0;
        
        predictions.forEach(prediction => {
            if (prediction.score > 0.5) { // Only count high-confidence detections
                if (carClasses.includes(prediction.class)) {
                    cars++;
                    totalConfidence += prediction.score;
                    detectionCount++;
                } else if (personClasses.includes(prediction.class)) {
                    people++;
                    totalConfidence += prediction.score;
                    detectionCount++;
                }
            }
        });
        
        const endTime = performance.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2) + 's';
        const averageConfidence = detectionCount > 0 ? (totalConfidence / detectionCount) : 0;
        
        const results = {
            cars: cars,
            people: people,
            confidence: averageConfidence.toFixed(2),
            processingTime: processingTime,
            boundingBoxArea: `${boundingBox.width} × ${boundingBox.height} pixels`,
            detections: predictions.filter(p => p.score > 0.5).map(p => ({
                class: p.class,
                confidence: (p.score * 100).toFixed(1) + '%',
                bbox: p.bbox
            }))
        };
        
        return results;
        
    } catch (error) {
        console.error('Detection error:', error);
        throw new Error('Failed to analyze image. Please try again.');
    }
}

// Display results in the main interface
function displayResults(results) {
    const resultContent = document.getElementById('resultContent');
    
    // Create detailed detections list
    let detectionsHtml = '';
    if (results.detections && results.detections.length > 0) {
        detectionsHtml = `
            <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Detailed Detections:</h4>
                <div style="max-height: 150px; overflow-y: auto;">
                    ${results.detections.map(detection => `
                        <div style="margin: 5px 0; padding: 5px; background: white; border-radius: 3px; font-size: 12px;">
                            <strong>${detection.class}</strong> - ${detection.confidence}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    resultContent.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">🚗 ${results.cars}</div>
                <div>Cars Detected</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #1976d2;">👥 ${results.people}</div>
                <div>People Detected</div>
            </div>
        </div>
        <div style="margin-top: 15px; font-size: 14px; color: #666;">
            <p><strong>Average Confidence:</strong> ${results.confidence > 0 ? (results.confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
            <p><strong>Processing Time:</strong> ${results.processingTime}</p>
            <p><strong>Analysis Area:</strong> ${results.boundingBoxArea}</p>
            <p><strong>Total Objects Found:</strong> ${results.detections ? results.detections.length : 0}</p>
        </div>
        ${detectionsHtml}
    `;
    
    document.getElementById('results').style.display = 'block';
}

// Show results in popup
function showResultPopup(results) {
    const popupContent = document.getElementById('popupContent');
    
    // Create detailed detections for popup
    let popupDetectionsHtml = '';
    if (results.detections && results.detections.length > 0) {
        const carDetections = results.detections.filter(d => ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(d.class));
        const personDetections = results.detections.filter(d => d.class === 'person');
        const otherDetections = results.detections.filter(d => !['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'person'].includes(d.class));
        
        popupDetectionsHtml = `
            <div style="margin-top: 20px; text-align: left;">
                <h4 style="margin: 10px 0; color: #333;">🔍 Detection Details:</h4>
                ${carDetections.length > 0 ? `
                    <div style="margin: 10px 0;">
                        <strong>🚗 Vehicles:</strong><br>
                        ${carDetections.map(d => `<span style="font-size: 12px; margin: 2px 5px; padding: 2px 6px; background: #e8f5e8; border-radius: 3px; display: inline-block;">${d.class} (${d.confidence})</span>`).join('')}
                    </div>
                ` : ''}
                ${personDetections.length > 0 ? `
                    <div style="margin: 10px 0;">
                        <strong>👥 People:</strong><br>
                        ${personDetections.map(d => `<span style="font-size: 12px; margin: 2px 5px; padding: 2px 6px; background: #e3f2fd; border-radius: 3px; display: inline-block;">${d.class} (${d.confidence})</span>`).join('')}
                    </div>
                ` : ''}
                ${otherDetections.length > 0 ? `
                    <div style="margin: 10px 0;">
                        <strong>🔍 Other Objects:</strong><br>
                        ${otherDetections.map(d => `<span style="font-size: 12px; margin: 2px 5px; padding: 2px 6px; background: #fff3e0; border-radius: 3px; display: inline-block;">${d.class} (${d.confidence})</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    popupContent.innerHTML = `
        <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-around; margin: 30px 0;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🚗</div>
                    <div style="font-size: 32px; font-weight: bold; color: #2e7d32;">${results.cars}</div>
                    <div style="font-size: 18px; color: #666;">Cars & Vehicles</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">👥</div>
                    <div style="font-size: 32px; font-weight: bold; color: #1976d2;">${results.people}</div>
                    <div style="font-size: 18px; color: #666;">People</div>
                </div>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 5px 0;"><strong>Average Confidence:</strong> ${results.confidence > 0 ? (results.confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Processing Time:</strong> ${results.processingTime}</p>
                <p style="margin: 5px 0;"><strong>Analyzed Area:</strong> ${results.boundingBoxArea}</p>
                <p style="margin: 5px 0;"><strong>Total Objects:</strong> ${results.detections ? results.detections.length : 0}</p>
            </div>
            ${popupDetectionsHtml}
        </div>
    `;
    
    document.getElementById('resultPopup').style.display = 'block';
}

// Close popup
function closePopup() {
    document.getElementById('resultPopup').style.display = 'none';
}

// Close popup when clicking outside
document.getElementById('resultPopup').addEventListener('click', function(e) {
    if (e.target === this) {
        closePopup();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePopup();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (boundingBox && !e.target.matches('input')) {
            e.preventDefault();
            clearBoundingBox();
        }
    }
});