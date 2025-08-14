# Vidter - Real Video Converter

A modern, fully functional web-based video converter that actually converts videos using FFmpeg.wasm. No fake conversions - real video processing with quality settings and format support.

## ✨ Features

- **Real Video Conversion**: Uses FFmpeg.wasm for actual video processing
- **Multiple Formats**: Convert to MP4, WebM, MOV, AVI, MKV
- **Quality Settings**: Choose from Fast, Balanced, High, and Ultra quality presets
- **Drag & Drop**: Easy file upload with drag and drop support
- **Progress Tracking**: Real-time conversion progress
- **File Validation**: Proper video file validation and size limits
- **Modern UI**: Beautiful, responsive design with Inter font
- **No Server Required**: Runs entirely in the browser
- **Free & Private**: No uploads to servers, all processing local

## 🚀 Getting Started

1. **Clone or download** the repository
2. **Open** `index.html` in a modern web browser
3. **Upload** a video file by dragging and dropping or clicking to browse
4. **Select** your desired output format and quality
5. **Convert** and download your video

## 📋 Supported Formats

### Input Formats
- MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V

### Output Formats
- **MP4**: H.264 video + AAC audio (most compatible)
- **WebM**: VP9 video + Vorbis audio (web optimized)
- **MOV**: H.264 video + AAC audio (Apple devices)
- **AVI**: H.264 video + MP3 audio (legacy support)
- **MKV**: H.264 video + AAC audio (container format)

## ⚙️ Quality Settings

- **Fast**: High quality, fast conversion (CRF 28, ultrafast preset)
- **Balanced**: Very high quality, balanced speed (CRF 23, medium preset)
- **High**: Excellent quality, slower conversion (CRF 18, slow preset)
- **Ultra**: Maximum quality, slowest conversion (CRF 15, veryslow preset)

## 🔧 Technical Details

- **Frontend**: Vanilla JavaScript (ES6+)
- **Video Processing**: FFmpeg.wasm 0.12.7
- **UI Framework**: Custom CSS with modern design
- **Font**: Inter (Google Fonts)
- **Browser Support**: Modern browsers with WebAssembly support

## 📁 File Structure

```
Vidter/
├── index.html          # Main application page
├── app.js             # Core application logic
├── styles.css         # Styling and responsive design
├── Assets/            # Images and logos
│   ├── Background.jpg
│   ├── Vidter logo.svg
│   └── ...
└── README.md          # This file
```

## 🌐 Browser Requirements

- **Chrome**: 67+ (recommended)
- **Firefox**: 60+
- **Safari**: 11.1+
- **Edge**: 79+

## ⚠️ Limitations

- **File Size**: Maximum 500MB per file
- **Processing**: Depends on device performance
- **Browser**: Requires WebAssembly support
- **Memory**: Large files may require significant RAM

## 🛠️ Development

To run locally:

1. **Simple HTTP Server** (required for FFmpeg.wasm):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx http-server
   ```

2. **Open** `http://localhost:8000` in your browser

## 🔒 Privacy & Security

- **No Uploads**: All processing happens in your browser
- **No Tracking**: No analytics or data collection
- **Open Source**: Transparent code for review
- **Local Only**: Files never leave your device

## 🎯 Use Cases

- **Content Creators**: Convert videos for different platforms
- **Developers**: Test video formats for web applications
- **Students**: Convert lecture recordings
- **Personal Use**: Format videos for different devices
- **Web Developers**: Client-side video processing

## 🐛 Troubleshooting

### Common Issues

1. **"FFmpeg not loaded"**: Check internet connection, refresh page
2. **"File too large"**: Use files under 500MB
3. **"Conversion failed"**: Try different format or quality setting
4. **"Browser not supported"**: Update to latest browser version

### Performance Tips

- Use smaller files for faster processing
- Choose "Fast" quality for quick conversions
- Close other browser tabs during conversion
- Use modern browsers for best performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Olumuyiwa Ezekiel** - Creator of Vidter

---

**Note**: This is a complete rewrite of the original Vidter application, now featuring real video conversion capabilities instead of simulated processing.
