# Image Object Counter with AI Detection

A web application that uses **TensorFlow.js** and the **COCO-SSD model** to detect and count cars and people in images. Users can upload images, draw bounding boxes to specify regions of interest, and get real-time object detection results.

## 🚀 Features

- 📁 **Image Upload**: Support for various image formats (JPEG, PNG, etc.)
- 🎯 **Interactive Bounding Box**: Draw regions of interest with mouse
- 🤖 **Real AI Detection**: Uses TensorFlow.js COCO-SSD model for object detection
- 🚗 **Vehicle Detection**: Detects cars, trucks, buses, motorcycles, and bicycles
- 👥 **People Detection**: Accurately counts people in images
- 📊 **Detailed Results**: Shows confidence scores, processing time, and detection details
- 🔍 **Real-time Analysis**: Client-side processing with no server required
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: TensorFlow.js v4.10.0
- **Model**: COCO-SSD v2.2.2 (pre-trained object detection model)
- **Canvas API**: For image manipulation and bounding box drawing
- **No Backend Required**: Fully client-side application

## 📋 How to Use

### 1. **Setup**
   - Open the application in a modern web browser
   - Wait for the AI model to load (shown with loading indicator)
   - Look for the success message confirming model is ready

### 2. **Upload an Image**
   - Click the "📁 Upload Image" button
   - Select an image file from your computer
   - The image will be displayed on the canvas

### 3. **Draw a Bounding Box**
   - Click and drag on the image to create a bounding box
   - The red dashed rectangle shows the area to be analyzed
   - You can redraw the box by creating a new one
   - Use Delete/Backspace to clear the current box

### 4. **Analyze Objects**
   - Click "🔍 Count Objects" to start AI analysis
   - Wait for processing (typically 1-3 seconds)
   - View results in both the main interface and popup window

### 5. **View Results**
   - **Main counts**: Cars/vehicles and people detected
   - **Confidence scores**: Average detection confidence
   - **Processing time**: How long the analysis took
   - **Detailed detections**: List of all objects found with individual confidence scores
   - **Categorized results**: Vehicles, people, and other objects separately

## ⌨️ Keyboard Shortcuts

- `Escape`: Close popup window
- `Delete/Backspace`: Clear current bounding box

## 🔧 Technical Details

### Object Detection Model
- **Model**: COCO-SSD (Common Objects in Context - Single Shot MultiBox Detector)
- **Classes Detected**: 80 different object types from the COCO dataset
- **Vehicle Classes**: car, truck, bus, motorcycle, bicycle
- **Person Class**: person
- **Confidence Threshold**: 50% (only objects with >50% confidence are counted)

### Performance
- **Model Size**: ~27MB (loaded once, cached by browser)
- **Processing Time**: 1-3 seconds depending on image size and device
- **Accuracy**: High accuracy for common objects in good lighting conditions
- **Browser Compatibility**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

### Detection Process
1. User draws bounding box on uploaded image
2. Selected region is extracted to a temporary canvas
3. TensorFlow.js COCO-SSD model analyzes the cropped image
4. Results are filtered by confidence threshold (>50%)
5. Objects are categorized into vehicles, people, and others
6. Counts and detailed results are displayed

## 🎯 Accuracy and Limitations

### What Works Well
- ✅ Clear, well-lit images
- ✅ Standard viewing angles
- ✅ Common vehicles (cars, trucks, buses)
- ✅ People in normal poses
- ✅ Medium to large objects

### Limitations
- ❌ Very small or distant objects
- ❌ Heavily occluded objects
- ❌ Unusual angles or perspectives
- ❌ Poor lighting conditions
- ❌ Artistic or stylized images

## 🔄 Extending the Application

### Adding New Object Types
```javascript
// In simulateObjectDetection function, modify the class arrays:
const animalClasses = ['dog', 'cat', 'horse', 'sheep', 'cow'];
const vehicleClasses = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'airplane', 'boat'];
```

### Adjusting Confidence Threshold
```javascript
// Change the confidence threshold in the detection loop:
if (prediction.score > 0.3) { // Lower threshold for more detections
    // ... counting logic
}
```

### Using Different Models
```javascript
// Replace COCO-SSD with other TensorFlow.js models:
// model = await mobilenet.load(); // For image classification
// model = await blazeface.load(); // For face detection
// model = await handpose.load(); // For hand detection
```

## 📁 File Structure

```
image_count/
├── index.html          # Main HTML interface with TensorFlow.js imports
├── script.js           # JavaScript with AI detection logic
└── README.md          # This documentation
```

## 🚀 Running the Application

### Local Development
```bash
# Navigate to project directory
cd image_count

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# Open browser to http://localhost:8000
```

### Production Deployment
- Upload files to any web server
- Ensure HTTPS for optimal TensorFlow.js performance
- No server-side processing required

## 🔒 Privacy and Security

- **Client-side Processing**: All image analysis happens in the browser
- **No Data Upload**: Images never leave your device
- **No API Keys Required**: Uses pre-trained models loaded from CDN
- **Offline Capable**: Works offline after initial model download

## 🐛 Troubleshooting

### Model Loading Issues
- **Slow Loading**: Large model download on first use
- **Loading Failure**: Check internet connection and browser compatibility
- **Memory Issues**: Close other browser tabs, refresh page

### Detection Issues
- **No Objects Found**: Try different bounding box area or image
- **Low Accuracy**: Ensure good lighting and clear objects
- **Slow Processing**: Reduce image size or bounding box area

### Browser Issues
- **Canvas Problems**: Enable JavaScript and HTML5 Canvas support
- **Performance**: Use latest browser version for best performance

## 🔮 Future Enhancements

- [ ] **Multiple Bounding Boxes**: Analyze multiple regions simultaneously
- [ ] **Real-time Webcam**: Live object detection from camera feed
- [ ] **Custom Models**: Support for specialized detection models
- [ ] **Batch Processing**: Analyze multiple images at once
- [ ] **Export Results**: Save results to CSV/JSON format
- [ ] **Advanced Filtering**: Filter by object size, confidence, etc.
- [ ] **Visualization**: Draw bounding boxes around detected objects
- [ ] **Mobile App**: Native mobile application version

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🙏 Acknowledgments

- **TensorFlow.js Team**: For the excellent machine learning framework
- **COCO Dataset**: For the comprehensive object detection dataset
- **Google Research**: For the COCO-SSD model architecture