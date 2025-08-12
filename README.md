# 🎬 Vidter - Video Converter

A modern, client-side video conversion web application built with vanilla JavaScript and FFmpeg.wasm. Convert your videos to any format without uploading to servers - everything happens in your browser!

![Vidter Screenshot](https://via.placeholder.com/800x400/1a1a1b/ffffff?text=Vidter+Video+Converter)

## ✨ Features

### 🎯 Core Functionality
- **Client-side conversion** - No server uploads, everything processes locally
- **Multiple formats** - MP4, WEBM, MOV, AVI, MP3
- **Drag & Drop** - Intuitive file upload interface
- **Batch processing** - Convert multiple files with queue system
- **Real-time progress** - Visual feedback during conversion

### 🎨 User Experience
- **Modern UI** - Dark theme with glassmorphism design
- **Responsive design** - Works on desktop and mobile
- **File preview** - See your files before conversion
- **Format suggestions** - Smart recommendations based on file type
- **Conversion history** - Track your past conversions
- **Keyboard shortcuts** - Power user features

### ⚙️ Advanced Features
- **Quality settings** - High, Medium, Low quality options
- **Audio bitrate control** - 128kbps to 320kbps
- **Advanced settings** - Resolution, frame rate, video bitrate
- **Queue management** - Pause, resume, clear conversions
- **Statistics tracking** - Monitor your usage

## 🚀 Quick Start

### Option 1: Use the Live Demo
Visit the deployed version at: [Vidter Demo](https://your-netlify-url.netlify.app)

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vidter.git
   cd vidter
   ```

2. **Open in browser**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Or simply open index-clean.html in your browser
   ```

3. **Start converting!**
   - Drag & drop video files
   - Select your desired format
   - Click "Start All" to begin conversion

## 📁 Project Structure

```
vidter/
├── index-clean.html      # Main HTML file (separated structure)
├── styles.css           # All CSS styles
├── script.js            # All JavaScript functionality
├── index.html           # Original single-file version
├── README.md            # This file
├── .gitignore           # Git ignore rules
└── LICENSE              # MIT License
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Video Processing**: FFmpeg.wasm (WebAssembly)
- **Styling**: Custom CSS with CSS Variables
- **Deployment**: Netlify (static hosting)
- **No Dependencies**: Pure vanilla implementation

## 🎮 Usage Guide

### Basic Conversion
1. **Upload Files**: Drag & drop or click "Browse files"
2. **Select Format**: Click "Convert file ▾" and choose your format
3. **Adjust Settings**: Use quality and audio bitrate controls
4. **Start Conversion**: Click "Start All" in the queue panel
5. **Download**: Files automatically download when complete

### Advanced Features
- **Queue Management**: Add multiple files, pause/resume conversions
- **Advanced Settings**: Click "Advanced Settings" for resolution/frame rate control
- **Keyboard Shortcuts**: Press `?` to see all shortcuts
- **History**: View your recent conversions in the history panel

### Supported Formats

| Input Formats | Output Formats |
|---------------|----------------|
| MP4, MOV, AVI | MP4, WEBM, MOV, AVI |
| WEBM, MKV | MP3 (audio extraction) |
| Audio files | MP3 |

## ⚡ Performance

- **File Size Limit**: 500MB per file
- **Batch Processing**: Up to 10 files simultaneously
- **Processing Speed**: Depends on file size and device performance
- **Memory Usage**: Optimized for modern browsers

## 🔧 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

**Note**: Requires WebAssembly support and modern browser features.

## 🚀 Deployment

### Netlify (Recommended)
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Deploy automatically on every push

### Manual Deployment
1. Upload all files to your web server
2. Ensure CORS headers are properly set
3. Access via HTTPS (required for FFmpeg.wasm)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - Client-side video processing
- [Inter Font](https://rsms.me/inter/) - Beautiful typography
- [Netlify](https://netlify.com) - Hosting platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/vidter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vidter/discussions)
- **Email**: your-email@example.com

## 🔄 Version History

- **v1.0.0** - Initial release with core conversion features
- **v1.1.0** - Added queue system and advanced settings
- **v1.2.0** - Added conversion history and statistics
- **v1.3.0** - Improved UI and keyboard shortcuts

---

Made with ❤️ by [Your Name]
