// Vidter - Real Video Converter Application
class VidterApp {
    constructor() {
        this.selectedFile = null;
        this.selectedFormat = 'mp4';
        this.selectedQuality = 'balanced';
        this.isConverting = false;
        this.convertedVideoUrl = null;
        this.convertedFileName = null;
        this.ffmpeg = null;
        this.isFFmpegLoaded = false;
        
        this.qualitySettings = {
            fast: { videoBitrate: '1000k', audioBitrate: '128k', preset: 'ultrafast', crf: 28 },
            balanced: { videoBitrate: '2000k', audioBitrate: '192k', preset: 'medium', crf: 23 },
            high: { videoBitrate: '4000k', audioBitrate: '256k', preset: 'slow', crf: 18 },
            ultra: { videoBitrate: '8000k', audioBitrate: '320k', preset: 'veryslow', crf: 15 }
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupEventListeners();
            this.updateProgress(10, 'Initializing...');
            
            // Load FFmpeg in background for better UX
            const ffmpegPromise = this.loadFFmpeg().then(() => {
                this.hideLoadingOverlay();
                this.showStatus('Vidter is ready! Upload a video to get started.', 'success');
            }).catch((error) => {
                console.error('FFmpeg loading failed:', error);
                this.hideLoadingOverlay();
                this.showStatus('Video converter loaded with limited features. Some conversions may not work.', 'warning');
            });
            
            // Add timeout to prevent infinite loading
            setTimeout(() => {
                if (!this.isFFmpegLoaded) {
                    this.hideLoadingOverlay();
                    this.showStatus('Loading taking longer than expected. You can still use the interface.', 'info');
                }
            }, 15000); // 15 second timeout
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.hideLoadingOverlay();
            this.showStatus('Failed to initialize Vidter. Please refresh the page.', 'error');
        }
    }
    
    async loadFFmpeg() {
        try {
            this.showStatus('Loading video converter...', 'info');
            
            if (typeof createFFmpeg === 'undefined') {
                throw new Error('FFmpeg.wasm not loaded. Please check your internet connection.');
            }
            
            this.ffmpeg = createFFmpeg({ 
                log: false, // Disable logging for faster loading
                corePath: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js'
            });
            
            this.ffmpeg.setProgress(({ ratio }) => {
                if (ratio < 1) {
                    this.updateProgress(Math.round(ratio * 80), `Loading FFmpeg... ${Math.round(ratio * 100)}%`);
                }
            });
            
            await this.ffmpeg.load();
            this.isFFmpegLoaded = true;
            console.log('FFmpeg loaded successfully');
            this.updateProgress(100, 'Ready!');
            this.showStatus('Video converter ready!', 'success');
            
        } catch (error) {
            console.error('FFmpeg loading failed:', error);
            throw new Error('Failed to load video converter. Please check your internet connection and try again.');
        }
    }
    
    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
            
            // Remove click event from upload area to prevent double opening
            // The browse link in HTML already handles file selection
        }
        
        const clearFileBtn = document.getElementById('clearFileBtn');
        if (clearFileBtn) {
            clearFileBtn.addEventListener('click', () => {
                this.clearSelectedFile();
            });
        }
        
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => {
                if (this.convertedVideoUrl) {
                    this.downloadConvertedVideo();
                } else if (this.selectedFile && !this.isConverting) {
                    this.startConversion();
                }
            });
        }
        
        this.setupDropdown('outputBtn', 'outputDropdown', (format) => {
            this.selectedFormat = format;
            this.updateOutputButton();
        });
        
        this.setupDropdown('qualityBtn', 'qualityDropdown', (quality) => {
            this.selectedQuality = quality;
            this.updateQualityButton();
        });
    }
    
    setupDropdown(buttonId, dropdownId, onSelect) {
        const button = document.getElementById(buttonId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!button || !dropdown) return;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
        });
        
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        const options = dropdown.querySelectorAll('[data-format], [data-quality]');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-format') || option.getAttribute('data-quality');
                onSelect(value);
                dropdown.style.display = 'none';
            });
        });
    }
    
    handleFileSelect(file) {
        console.log('File selected:', file.name, file.size, file.type);
        
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/avi'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i)) {
            this.showStatus('Please select a valid video file (MP4, WebM, MOV, AVI, MKV, FLV, WMV, M4V)', 'error');
            return;
        }
        
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            this.showStatus('File too large. Please select a file smaller than 500MB', 'error');
            return;
        }
        
        this.selectedFile = file;
        this.updateFileInfo();
        this.showFileInfoSection();
        this.updateUploadArea();
        this.resetConversionState();
        this.updateConvertButton();
        this.showStatus('Video file selected successfully!', 'success');
    }
    
    updateFileInfo() {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileName) fileName.textContent = this.selectedFile.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(this.selectedFile.size);
    }
    
    showFileInfoSection() {
        const fileInfoSection = document.getElementById('fileInfoSection');
        const clearFileBtn = document.getElementById('clearFileBtn');
        
        if (fileInfoSection) fileInfoSection.style.display = 'block';
        if (clearFileBtn) clearFileBtn.style.display = 'block';
    }
    
    updateUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadContent = document.getElementById('uploadContent');
        
        if (uploadArea && uploadContent) {
            uploadArea.classList.add('uploading');
            uploadContent.style.display = 'none';
            
            const video = document.createElement('video');
            video.src = URL.createObjectURL(this.selectedFile);
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '12px';
            video.muted = true;
            video.playsInline = true;
            
            uploadArea.appendChild(video);
        }
    }
    
    resetConversionState() {
        if (this.convertedVideoUrl) {
            URL.revokeObjectURL(this.convertedVideoUrl);
            this.convertedVideoUrl = null;
            this.convertedFileName = null;
        }
    }
    
    clearSelectedFile() {
        this.selectedFile = null;
        this.resetConversionState();
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileName) fileName.textContent = 'Video name';
        if (fileSize) fileSize.textContent = '0 MB';
        
        const fileInfoSection = document.getElementById('fileInfoSection');
        const clearFileBtn = document.getElementById('clearFileBtn');
        
        if (fileInfoSection) fileInfoSection.style.display = 'none';
        if (clearFileBtn) clearFileBtn.style.display = 'none';
        
        const uploadArea = document.getElementById('uploadArea');
        const uploadContent = document.getElementById('uploadContent');
        
        if (uploadArea && uploadContent) {
            uploadArea.classList.remove('uploading');
            uploadContent.style.display = 'block';
            
            const video = uploadArea.querySelector('video');
            if (video) uploadArea.removeChild(video);
        }
        
        this.updateConvertButton();
    }
    
    async startConversion() {
        if (!this.selectedFile) {
            this.showStatus('Please select a video file', 'error');
            return;
        }
        
        if (this.isConverting) {
            this.showStatus('Conversion already in progress', 'warning');
            return;
        }
        
        if (!this.isFFmpegLoaded) {
            this.showStatus('Video converter not ready. Please wait...', 'error');
            return;
        }
        
        this.isConverting = true;
        this.updateConvertButton();
        this.showProgress();
        
        try {
            this.updateProgress(0, 'Starting conversion...');
            
            const result = await this.convertVideo(this.selectedFile, this.selectedFormat, this.selectedQuality);
            
            this.convertedVideoUrl = result.url;
            this.convertedFileName = result.fileName;
            
            this.updateConvertButton();
            this.updateProgress(100, 'Conversion complete!');
            
            const originalSize = this.formatFileSize(this.selectedFile.size);
            const finalSize = this.formatFileSize(result.blob.size);
            
            this.showStatus(`✅ Conversion complete! (${originalSize} → ${finalSize})`, 'success');
            
        } catch (error) {
            console.error('Conversion failed:', error);
            this.showStatus(`❌ Conversion failed: ${error.message}`, 'error');
        } finally {
            this.isConverting = false;
            setTimeout(() => this.hideProgress(), 2000);
            this.updateConvertButton();
        }
    }
    
    async convertVideo(file, targetFormat, quality) {
        console.log('Starting real video conversion:', { 
            fileName: file.name, 
            targetFormat, 
            quality,
            fileSize: this.formatFileSize(file.size)
        });
        
        const settings = this.qualitySettings[quality];
        const inputFileName = `input.${this.getFileExtension(file.name)}`;
        const outputFileName = `output.${targetFormat}`;
        
        try {
            this.updateProgress(10, 'Preparing video...');
            this.ffmpeg.FS('writeFile', inputFileName, await this.fileToUint8Array(file));
            
            // Try primary command first
            let command = this.buildFFmpegCommand(inputFileName, outputFileName, targetFormat, settings);
            
            console.log('FFmpeg command:', command);
            
            this.updateProgress(20, 'Converting video...');
            
            try {
                await this.ffmpeg.run(...command);
            } catch (primaryError) {
                console.log('Primary conversion failed, trying fallback...', primaryError);
                
                // Fallback to simpler command for better compatibility
                const fallbackCommand = this.buildFallbackCommand(inputFileName, outputFileName, targetFormat);
                console.log('Fallback FFmpeg command:', fallbackCommand);
                
                await this.ffmpeg.run(...fallbackCommand);
            }
            
            this.updateProgress(90, 'Finalizing...');
            const outputData = this.ffmpeg.FS('readFile', outputFileName);
            
            const mimeType = this.getMimeType(targetFormat);
            const blob = new Blob([outputData.buffer], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            this.ffmpeg.FS('unlink', inputFileName);
            this.ffmpeg.FS('unlink', outputFileName);
            
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '_converted.' + targetFormat;
            
            console.log('Conversion successful:', { 
                originalSize: this.formatFileSize(file.size),
                convertedSize: this.formatFileSize(blob.size),
                fileName,
                mimeType
            });
            
            return { url, fileName, blob };
            
        } catch (error) {
            console.error('FFmpeg conversion error:', error);
            throw new Error('Video conversion failed. Please try a different file or format.');
        }
    }
    
    buildFFmpegCommand(inputFile, outputFile, format, settings) {
        const baseCommand = ['-i', inputFile];
        
        // Simplified command for better compatibility
        const videoSettings = [
            '-c:v', this.getVideoCodec(format),
            '-preset', settings.preset,
            '-crf', settings.crf.toString()
        ];
        
        const audioSettings = [
            '-c:a', this.getAudioCodec(format)
        ];
        
        const formatSettings = this.getFormatSettings(format);
        
        return [...baseCommand, ...videoSettings, ...audioSettings, ...formatSettings, outputFile];
    }
    
    getVideoCodec(format) {
        const codecs = {
            mp4: 'libx264',
            webm: 'libvpx',  // Changed from libvpx-vp9 for better compatibility
            mov: 'libx264',
            avi: 'libx264',
            mkv: 'libx264'
        };
        return codecs[format] || 'libx264';
    }
    
    getAudioCodec(format) {
        const codecs = {
            mp4: 'aac',
            webm: 'libvorbis',
            mov: 'aac',
            avi: 'libmp3lame',  // Changed from mp3 for better compatibility
            mkv: 'aac'
        };
        return codecs[format] || 'aac';
    }
    
    getFormatSettings(format) {
        const settings = {
            mp4: ['-movflags', '+faststart', '-pix_fmt', 'yuv420p'],  // Added yuv420p for better compatibility
            webm: [],
            mov: ['-movflags', '+faststart', '-pix_fmt', 'yuv420p'],  // Added yuv420p for better compatibility
            avi: ['-pix_fmt', 'yuv420p'],  // Added yuv420p for better compatibility
            mkv: []
        };
        return settings[format] || [];
    }
    
    buildFallbackCommand(inputFile, outputFile, format) {
        // Simple fallback command for maximum compatibility
        const baseCommand = ['-i', inputFile];
        
        let codecSettings = [];
        if (format === 'mp4') {
            codecSettings = ['-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'];
        } else if (format === 'webm') {
            codecSettings = ['-c:v', 'libvpx', '-c:a', 'libvorbis'];
        } else if (format === 'mov') {
            codecSettings = ['-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'];
        } else if (format === 'avi') {
            codecSettings = ['-c:v', 'libx264', '-c:a', 'libmp3lame', '-pix_fmt', 'yuv420p'];
        } else {
            codecSettings = ['-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'];
        }
        
        return [...baseCommand, ...codecSettings, outputFile];
    }
    
    getMimeType(format) {
        const mimeTypes = {
            mp4: 'video/mp4',
            webm: 'video/webm',
            mov: 'video/quicktime',
            avi: 'video/x-msvideo',
            mkv: 'video/x-matroska'
        };
        return mimeTypes[format] || 'video/mp4';
    }
    
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    async fileToUint8Array(file) {
        return new Uint8Array(await file.arrayBuffer());
    }
    
    downloadConvertedVideo() {
        if (!this.convertedVideoUrl || !this.convertedFileName) {
            this.showStatus('No converted video available', 'error');
            return;
        }
        
        try {
            const a = document.createElement('a');
            a.href = this.convertedVideoUrl;
            a.download = this.convertedFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            this.showStatus('✅ Download started!', 'success');
            
            setTimeout(() => {
                this.convertedVideoUrl = null;
                this.convertedFileName = null;
                this.updateConvertButton();
            }, 2000);
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showStatus('❌ Download failed', 'error');
        }
    }
    
    updateConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        if (!convertBtn) return;
        
        if (this.isConverting) {
            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
        } else if (this.convertedVideoUrl) {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Download';
            convertBtn.className = 'convert-btn download-ready';
        } else if (this.selectedFile) {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert file';
            convertBtn.className = 'convert-btn';
        } else {
            convertBtn.disabled = true;
            convertBtn.textContent = 'Convert file';
            convertBtn.className = 'convert-btn';
        }
    }
    
    updateOutputButton() {
        const outputBtn = document.getElementById('outputBtn');
        if (outputBtn) {
            outputBtn.textContent = `Output - ${this.selectedFormat.toUpperCase()}`;
        }
    }
    
    updateQualityButton() {
        const qualityBtn = document.getElementById('qualityBtn');
        if (qualityBtn) {
            const qualityLabels = {
                fast: 'Fast (High Quality)',
                balanced: 'Balanced (Very High Quality)',
                high: 'High (Excellent Quality)',
                ultra: 'Ultra (Maximum Quality)'
            };
            qualityBtn.textContent = qualityLabels[this.selectedQuality] || 'Quality';
        }
    }
    
    showProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) progressContainer.style.display = 'block';
    }
    
    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) progressContainer.style.display = 'none';
    }
    
    updateProgress(percent, message = '') {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText && message) progressText.textContent = message;
    }
    
    showStatus(message, type = 'info') {
        console.log(`Status [${type}]:`, message);
        
        const statusMessage = document.getElementById('statusMessage');
        if (!statusMessage) return;
        
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
    
    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Vidter application...');
    window.vidterApp = new VidterApp();
});
