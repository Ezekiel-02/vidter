// Global variables
let ffmpeg = null;
let selectedFile = null;
let selectedFormat = 'mp4';
let isConverting = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
    initOutputSelector();
    initConvertButton();
    
    // Show file info section by default with placeholder
    const fileInfoSection = document.getElementById('fileInfoSection');
    if (fileInfoSection) {
        fileInfoSection.style.display = 'flex';
    }
});

// Initialize FFmpeg
async function initFFmpeg() {
  try {
    showStatus('Initializing video converter... This may take a moment.', 'info');
    
    ffmpeg = createFFmpeg({ log: true });
    
    ffmpeg.setProgress(({ ratio }) => {
      const percent = Math.round(ratio * 100);
      showStatus(`Loading converter... ${percent}%`, 'info');
    });
    
    await ffmpeg.load();
    
    showStatus('Video converter ready!', 'success');
    updateConvertButton();
  } catch (error) {
    console.error('FFmpeg initialization failed:', error);
    showStatus('Failed to initialize video converter. Please refresh the page.', 'error');
  }
}

// File upload functionality
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = document.getElementById('uploadContent');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressFill = document.getElementById('uploadProgressFill');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const subtitle = document.getElementById('subtitle');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileInfoSection = document.getElementById('fileInfoSection');

    if (!uploadArea || !fileInput) return;

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('video/')) {
            showStatus('Please select a valid video file.', 'error');
            return;
        }

        // Show uploading state
        uploadArea.classList.add('uploading');
        uploadContent.style.display = 'none';
        uploadProgress.style.display = 'flex';
        
        // Update subtitle
        subtitle.textContent = 'Your video is currently uploading. Please hold on until it\'s complete.';
        
        // Show file info section
        fileInfoSection.style.display = 'flex';
        
        // Update file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Simulate upload progress
        simulateUploadProgress(file);
    }

    function simulateUploadProgress(file) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Upload complete
                setTimeout(() => {
                    uploadArea.classList.remove('uploading');
                    uploadContent.style.display = 'block';
                    uploadProgress.style.display = 'none';
                    subtitle.textContent = 'Easily convert your video files to any format you need, whether it\'s MP4, AVI, or MOV. Enjoy seamless compatibility across all devices and platforms!';
                    
                    // Enable convert button
                    const convertBtn = document.getElementById('convertBtn');
                    if (convertBtn) {
                        convertBtn.disabled = false;
                    }
                }, 500);
            }
            
            uploadProgressFill.style.width = progress + '%';
            uploadProgressText.textContent = `Uploading video / ${Math.round(progress)}%`;
        }, 200);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Output format selector
function initOutputSelector() {
  const outputBtn = document.getElementById('outputBtn');
  const outputDropdown = document.getElementById('outputDropdown');
  const outputOptions = document.querySelectorAll('.output-option');

  // Toggle dropdown
  outputBtn.addEventListener('click', function() {
    const isExpanded = outputDropdown.style.display !== 'none';
    
    if (isExpanded) {
      outputDropdown.style.display = 'none';
      this.setAttribute('aria-expanded', 'false');
    } else {
      outputDropdown.style.display = 'block';
      this.setAttribute('aria-expanded', 'true');
    }
  });

  // Handle option selection
  outputOptions.forEach(option => {
    option.addEventListener('click', function() {
      const format = this.getAttribute('data-format');
      selectedFormat = format;
      
      outputBtn.innerHTML = `Output - ${format.toUpperCase()} <svg class="arrow-down" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      outputDropdown.style.display = 'none';
      outputBtn.setAttribute('aria-expanded', 'false');
      
      updateConvertButton();
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!outputBtn.contains(e.target) && !outputDropdown.contains(e.target)) {
      outputDropdown.style.display = 'none';
      outputBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Convert button functionality
function initConvertButton() {
  const convertBtn = document.getElementById('convertBtn');
  
  convertBtn.addEventListener('click', function() {
    if (selectedFile && !isConverting) {
      startConversion();
    }
  });
}

function updateConvertButton() {
  const convertBtn = document.getElementById('convertBtn');
  
  if (ffmpeg && ffmpeg.isLoaded() && selectedFile) {
    convertBtn.disabled = false;
    convertBtn.textContent = 'Convert file';
  } else if (!ffmpeg || !ffmpeg.isLoaded()) {
    convertBtn.disabled = true;
    convertBtn.textContent = 'Loading converter...';
  } else {
    convertBtn.disabled = true;
    convertBtn.textContent = 'Convert file';
  }
}

// Conversion functionality
async function startConversion() {
  if (!ffmpeg || !ffmpeg.isLoaded()) {
    showStatus('Video converter is still initializing. Please wait for the "Video converter ready!" message.', 'error');
    return;
  }
  
  if (!selectedFile) {
    showStatus('Please select a video file to convert', 'error');
    return;
  }

  isConverting = true;
  updateConvertButton();
  showProgress();

  try {
    await convertVideo(selectedFile, selectedFormat);
    showStatus(`Successfully converted ${selectedFile.name} to ${selectedFormat.toUpperCase()}`, 'success');
  } catch (error) {
    console.error('Conversion error:', error);
    showStatus(`Failed to convert ${selectedFile.name}: ${error.message}`, 'error');
  } finally {
    isConverting = false;
    hideProgress();
    updateConvertButton();
  }
}

async function convertVideo(file, targetFormat) {
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + targetFormat;
  
  // Write input file
  ffmpeg.FS('writeFile', inputName, await fetchFile(file));
  
  // Build FFmpeg command
  let command = ['-i', inputName];
  
  // Add quality settings (you can customize these)
  command.push('-crf', '23'); // Medium quality
  
  // Add output format
  command.push(outputName);
  
  // Run conversion
  await ffmpeg.run(...command);
  
  // Read output file
  const data = ffmpeg.FS('readFile', outputName);
  
  // Create download link
  const blob = new Blob([data.buffer], { type: `video/${targetFormat}` });
  const url = URL.createObjectURL(blob);
  
  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
  a.click();
  
  // Cleanup
  URL.revokeObjectURL(url);
  ffmpeg.FS('unlink', inputName);
  ffmpeg.FS('unlink', outputName);
  
  return url;
}

function fetchFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Progress functionality
function showProgress() {
  const progressContainer = document.getElementById('progressContainer');
  const progressText = document.getElementById('progressText');
  
  progressContainer.style.display = 'block';
  progressText.textContent = 'Converting video...';
  
  // Simulate progress (in a real implementation, you'd use actual FFmpeg progress)
  let progress = 0;
  const progressFill = document.getElementById('progressFill');
  
  const progressInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
    }
    progressFill.style.width = progress + '%';
  }, 200);
}

function hideProgress() {
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  
  progressContainer.style.display = 'none';
  progressFill.style.width = '0%';
}

// Status messages
function showStatus(message, type = 'info') {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 5000);
}
