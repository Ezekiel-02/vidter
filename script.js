// Global variables
let ffmpeg = null;
let selectedFile = null;
let selectedFormat = 'mp4';
let isConverting = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Check if all required elements exist
  const requiredElements = [
    'uploader', 'fileInput', 'fileInfoSection', 'fileName', 'fileSize',
    'outputBtn', 'outputDropdown', 'convertBtn', 'progressContainer'
  ];

  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  if (missingElements.length > 0) {
    console.error('Missing required elements:', missingElements);
    showStatus('Error: Some required elements are missing. Please refresh the page.', 'error');
    return;
  }

  // Initialize components
  initFFmpeg();
  initFileUpload();
  initOutputSelector();
  initConvertButton();
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
  const uploader = document.getElementById('uploader');
  const fileInput = document.getElementById('fileInput');

  // File input change
  fileInput.addEventListener('change', handleFileSelect);

  // Drag and drop functionality
  uploader.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  uploader.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
  });

  uploader.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect({ target: { files: droppedFiles } });
    }
  });
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  // For now, we'll handle only the first file
  const file = files[0];
  
  // Validate file type
  if (!file.type.startsWith('video/')) {
    showStatus('Please select a valid video file', 'error');
    return;
  }

  selectedFile = file;
  updateFileInfo(file);
  updateConvertButton();
}

function updateFileInfo(file) {
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const fileInfoSection = document.getElementById('fileInfoSection');

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileInfoSection.style.display = 'flex';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
