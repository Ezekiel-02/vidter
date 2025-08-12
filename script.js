// Global variables
let ffmpeg = null;
let files = [];
let conversionQueue = [];
let currentTool = null;
let isConverting = false;

// Tool configurations
const toolConfigs = {
  // Video & Audio tools
  'video-converter': {
    name: 'Video Converter',
    description: 'Convert between video formats',
    acceptTypes: 'video/*',
    formats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'],
    category: 'video'
  },
  'audio-converter': {
    name: 'Audio Converter',
    description: 'Convert audio files',
    acceptTypes: 'audio/*',
    formats: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'],
    category: 'audio'
  },
  'mp3-converter': {
    name: 'MP3 Converter',
    description: 'Convert to MP3 format',
    acceptTypes: 'audio/*,video/*',
    formats: ['mp3'],
    category: 'audio'
  },
  'mp4-to-mp3': {
    name: 'MP4 to MP3',
    description: 'Extract audio from MP4',
    acceptTypes: 'video/mp4',
    formats: ['mp3'],
    category: 'video'
  },
  'video-to-mp3': {
    name: 'Video to MP3',
    description: 'Extract audio from video',
    acceptTypes: 'video/*',
    formats: ['mp3'],
    category: 'video'
  },
  'mp4-converter': {
    name: 'MP4 Converter',
    description: 'Convert to/from MP4',
    acceptTypes: 'video/*',
    formats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    category: 'video'
  },
  'mov-to-mp4': {
    name: 'MOV to MP4',
    description: 'Convert MOV to MP4',
    acceptTypes: 'video/quicktime,video/mp4',
    formats: ['mp4'],
    category: 'video'
  },
  'mp3-to-ogg': {
    name: 'MP3 to OGG',
    description: 'Convert MP3 to OGG',
    acceptTypes: 'audio/mpeg,audio/mp3',
    formats: ['ogg'],
    category: 'audio'
  },

  // Image tools
  'image-converter': {
    name: 'Image Converter',
    description: 'Convert between image formats',
    acceptTypes: 'image/*',
    formats: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'],
    category: 'image'
  },
  'webp-to-png': {
    name: 'WEBP to PNG',
    description: 'Convert WEBP to PNG',
    acceptTypes: 'image/webp',
    formats: ['png'],
    category: 'image'
  },
  'jfif-to-png': {
    name: 'JFIF to PNG',
    description: 'Convert JFIF to PNG',
    acceptTypes: 'image/jpeg,image/jfif',
    formats: ['png'],
    category: 'image'
  },
  'png-to-svg': {
    name: 'PNG to SVG',
    description: 'Convert PNG to SVG',
    acceptTypes: 'image/png',
    formats: ['svg'],
    category: 'image'
  },
  'heic-to-jpg': {
    name: 'HEIC to JPG',
    description: 'Convert HEIC to JPG',
    acceptTypes: 'image/heic,image/heif',
    formats: ['jpg', 'jpeg'],
    category: 'image'
  },
  'heic-to-png': {
    name: 'HEIC to PNG',
    description: 'Convert HEIC to PNG',
    acceptTypes: 'image/heic,image/heif',
    formats: ['png'],
    category: 'image'
  },
  'webp-to-jpg': {
    name: 'WEBP to JPG',
    description: 'Convert WEBP to JPG',
    acceptTypes: 'image/webp',
    formats: ['jpg', 'jpeg'],
    category: 'image'
  },

  // PDF & Documents tools
  'pdf-converter': {
    name: 'PDF Converter',
    description: 'Convert PDF files',
    acceptTypes: 'application/pdf',
    formats: ['jpg', 'png', 'docx', 'txt', 'html'],
    category: 'pdf'
  },
  'document-converter': {
    name: 'Document Converter',
    description: 'Convert documents',
    acceptTypes: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain',
    formats: ['pdf', 'docx', 'txt', 'html'],
    category: 'pdf'
  },
  'ebook-converter': {
    name: 'Ebook Converter',
    description: 'Convert ebooks',
    acceptTypes: 'application/epub+zip,application/x-mobipocket-ebook',
    formats: ['pdf', 'epub', 'mobi', 'txt'],
    category: 'pdf'
  },
  'pdf-to-word': {
    name: 'PDF to Word',
    description: 'Convert PDF to Word',
    acceptTypes: 'application/pdf',
    formats: ['docx'],
    category: 'pdf'
  },
  'pdf-to-jpg': {
    name: 'PDF to JPG',
    description: 'Convert PDF to JPG',
    acceptTypes: 'application/pdf',
    formats: ['jpg', 'jpeg'],
    category: 'pdf'
  },
  'pdf-to-epub': {
    name: 'PDF to EPUB',
    description: 'Convert PDF to EPUB',
    acceptTypes: 'application/pdf',
    formats: ['epub'],
    category: 'pdf'
  },
  'epub-to-pdf': {
    name: 'EPUB to PDF',
    description: 'Convert EPUB to PDF',
    acceptTypes: 'application/epub+zip',
    formats: ['pdf'],
    category: 'pdf'
  },
  'heic-to-pdf': {
    name: 'HEIC to PDF',
    description: 'Convert HEIC to PDF',
    acceptTypes: 'image/heic,image/heif',
    formats: ['pdf'],
    category: 'pdf'
  },
  'docx-to-pdf': {
    name: 'DOCX to PDF',
    description: 'Convert DOCX to PDF',
    acceptTypes: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    formats: ['pdf'],
    category: 'pdf'
  },
  'jpg-to-pdf': {
    name: 'JPG to PDF',
    description: 'Convert JPG to PDF',
    acceptTypes: 'image/jpeg,image/jpg',
    formats: ['pdf'],
    category: 'pdf'
  },

  // GIF tools
  'video-to-gif': {
    name: 'Video to GIF',
    description: 'Convert video to GIF',
    acceptTypes: 'video/*',
    formats: ['gif'],
    category: 'gif'
  },
  'mp4-to-gif': {
    name: 'MP4 to GIF',
    description: 'Convert MP4 to GIF',
    acceptTypes: 'video/mp4',
    formats: ['gif'],
    category: 'gif'
  },
  'webm-to-gif': {
    name: 'WEBM to GIF',
    description: 'Convert WEBM to GIF',
    acceptTypes: 'video/webm',
    formats: ['gif'],
    category: 'gif'
  },
  'apng-to-gif': {
    name: 'APNG to GIF',
    description: 'Convert APNG to GIF',
    acceptTypes: 'image/apng',
    formats: ['gif'],
    category: 'gif'
  },
  'gif-to-mp4': {
    name: 'GIF to MP4',
    description: 'Convert GIF to MP4',
    acceptTypes: 'image/gif',
    formats: ['mp4'],
    category: 'gif'
  },
  'gif-to-apng': {
    name: 'GIF to APNG',
    description: 'Convert GIF to APNG',
    acceptTypes: 'image/gif',
    formats: ['apng'],
    category: 'gif'
  },
  'image-to-gif': {
    name: 'Image to GIF',
    description: 'Convert image to GIF',
    acceptTypes: 'image/*',
    formats: ['gif'],
    category: 'gif'
  },

  // Others tools
  'unit-converter': {
    name: 'Unit Converter',
    description: 'Convert units',
    acceptTypes: '*/*',
    formats: ['txt', 'csv'],
    category: 'others'
  },
  'time-converter': {
    name: 'Time Converter',
    description: 'Convert time formats',
    acceptTypes: '*/*',
    formats: ['txt', 'csv'],
    category: 'others'
  },
  'archive-converter': {
    name: 'Archive Converter',
    description: 'Convert archives',
    acceptTypes: 'application/zip,application/x-rar-compressed,application/x-7z-compressed',
    formats: ['zip', 'rar', '7z', 'tar'],
    category: 'others'
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Check if all required elements exist
  const requiredElements = [
    'categoryContent', 'converterInterface', 'uploader', 'fileInput',
    'filePreview', 'settingsPanel', 'convertBtn', 'formatList',
    'queuePanel', 'historyPanel', 'progressContainer'
  ];

  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  if (missingElements.length > 0) {
    console.error('Missing required elements:', missingElements);
    showStatus('Error: Some required elements are missing. Please refresh the page.', 'error');
    return;
  }

  // Initialize components
  initNavigation();
  initToolCards();
  initFFmpeg();
  loadHistory();
  setupQueueControls();
  setupAdvancedSettings();
  setupKeyboardShortcuts();
  loadStats();
});

// Navigation functionality
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const categoryContents = document.querySelectorAll('.category-content');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const category = this.getAttribute('data-category');
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding category content
      categoryContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${category}-category`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Tool card functionality
function initToolCards() {
  const toolCards = document.querySelectorAll('.tool-card');
  
  toolCards.forEach(card => {
    card.addEventListener('click', function() {
      const toolId = this.getAttribute('data-tool');
      openConverter(toolId);
    });
  });
}

// Open converter interface
function openConverter(toolId) {
  const toolConfig = toolConfigs[toolId];
  if (!toolConfig) {
    showStatus('Tool configuration not found', 'error');
    return;
  }

  currentTool = toolId;
  
  // Hide category content and show converter interface
  document.getElementById('categoryContent').style.display = 'none';
  document.getElementById('converterInterface').style.display = 'block';
  
  // Update converter title
  document.getElementById('converterTitle').textContent = toolConfig.name;
  
  // Update file input accept types
  document.getElementById('fileInput').accept = toolConfig.acceptTypes;
  
  // Update file hint text
  const fileHint = document.getElementById('filehint');
  fileHint.innerHTML = `Drag and drop your ${toolConfig.category} files here <span style="color:rgba(255,255,255,0.45)">/</span>
    <label for="fileInput" style="display:inline-block;">
      <a class="browse" href="#" onclick="document.getElementById('fileInput').click(); return false;">Browse files</a>
    </label>`;
  
  // Populate format options
  populateFormatOptions(toolConfig.formats);
  
  // Clear previous files
  files = [];
  updateFilePreview();
  updateFileList();
}

// Populate format options based on tool
function populateFormatOptions(formats) {
  const formatList = document.getElementById('formatList');
  formatList.innerHTML = '';
  
  formats.forEach(format => {
    const formatCard = document.createElement('div');
    formatCard.className = 'format-card';
    formatCard.setAttribute('role', 'button');
    formatCard.setAttribute('data-format', format);
    formatCard.textContent = `to ${format.toUpperCase()}`;
    
    formatCard.addEventListener('click', function() {
      selectFormat(format);
    });
    
    formatList.appendChild(formatCard);
  });
}

// Back to tools functionality
document.getElementById('backToTools').addEventListener('click', function() {
  document.getElementById('converterInterface').style.display = 'none';
  document.getElementById('categoryContent').style.display = 'block';
  
  // Reset state
  currentTool = null;
  files = [];
  updateFilePreview();
  updateFileList();
  
  // Hide format list
  document.getElementById('formatList').style.display = 'none';
  document.getElementById('chosen').textContent = '';
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

// Update convert button state
function updateConvertButton() {
  const convertBtn = document.getElementById('convertBtn');
  if (ffmpeg && ffmpeg.isLoaded()) {
    convertBtn.textContent = 'Convert file ▾';
    convertBtn.disabled = false;
  } else {
    convertBtn.textContent = 'Loading converter...';
    convertBtn.disabled = true;
  }
}

// File handling
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const selectedFiles = Array.from(event.target.files);
  addFiles(selectedFiles);
}

// Drag and drop functionality
const uploader = document.getElementById('uploader');

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
  addFiles(droppedFiles);
});

function addFiles(newFiles) {
  const toolConfig = toolConfigs[currentTool];
  if (!toolConfig) return;
  
  newFiles.forEach(file => {
    // Validate file type
    if (toolConfig.acceptTypes === '*/*' || file.type.match(toolConfig.acceptTypes)) {
      files.push(file);
    } else {
      showStatus(`Invalid file type: ${file.name}`, 'error');
    }
  });
  
  updateFilePreview();
  updateFileList();
}

function updateFilePreview() {
  const preview = document.getElementById('filePreview');
  preview.innerHTML = '';
  
  files.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const icon = getFileIcon(file.type);
    const size = formatFileSize(file.size);
    
    fileItem.innerHTML = `
      <div class="file-info">
        <div class="file-icon">${icon}</div>
        <div class="file-details">
          <h4>${file.name}</h4>
          <p>${size}</p>
        </div>
      </div>
      <button class="remove-file" onclick="removeFile(${index})">Remove</button>
    `;
    
    preview.appendChild(fileItem);
  });
}

function updateFileList() {
  const selectedFiles = document.getElementById('selectedFiles');
  if (files.length === 0) {
    selectedFiles.textContent = '';
  } else {
    selectedFiles.textContent = `${files.length} file(s) selected`;
  }
}

// Make removeFile global
window.removeFile = function(index) {
  files.splice(index, 1);
  updateFilePreview();
  updateFileList();
};

function getFileIcon(mimeType) {
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('epub')) return '📚';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📁';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert button functionality
document.getElementById('convertBtn').addEventListener('click', function() {
  const formatList = document.getElementById('formatList');
  const isExpanded = formatList.style.display !== 'none';
  
  if (isExpanded) {
    formatList.style.display = 'none';
    this.setAttribute('aria-expanded', 'false');
  } else {
    formatList.style.display = 'block';
    this.setAttribute('aria-expanded', 'true');
  }
});

function selectFormat(format) {
  document.getElementById('chosen').textContent = `Selected: ${format.toUpperCase()}`;
  document.getElementById('formatList').style.display = 'none';
  document.getElementById('convertBtn').setAttribute('aria-expanded', 'false');
  
  if (files.length > 0) {
    startConversion(format);
  } else {
    showStatus('Please select files to convert', 'error');
  }
}

// Conversion functionality
async function startConversion(targetFormat) {
  if (!ffmpeg || !ffmpeg.isLoaded()) {
    showStatus('Video converter is still initializing. Please wait for the "Video converter ready!" message.', 'error');
    return;
  }
  
  if (files.length === 0) {
    showStatus('Please select files to convert', 'error');
    return;
  }
  
  const toolConfig = toolConfigs[currentTool];
  if (!toolConfig) {
    showStatus('Tool configuration not found', 'error');
    return;
  }
  
  // Add files to queue
  files.forEach(file => {
    const queueItem = {
      file: file,
      targetFormat: targetFormat,
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
      tool: currentTool
    };
    conversionQueue.push(queueItem);
  });
  
  updateQueueDisplay();
  
  // Start processing queue
  if (!isConverting) {
    processQueue();
  }
  
  // Clear current files
  files = [];
  updateFilePreview();
  updateFileList();
}

async function processQueue() {
  if (conversionQueue.length === 0) {
    isConverting = false;
    return;
  }
  
  isConverting = true;
  
  for (let i = 0; i < conversionQueue.length; i++) {
    const item = conversionQueue[i];
    if (item.status === 'pending') {
      item.status = 'converting';
      item.startTime = Date.now();
      updateQueueDisplay();
      
      try {
        await convertFile(item);
        item.status = 'completed';
        item.progress = 100;
        item.endTime = Date.now();
        
        // Add to history
        addToHistory(item);
        
        showStatus(`Converted ${item.file.name} to ${item.targetFormat.toUpperCase()}`, 'success');
      } catch (error) {
        console.error('Conversion error:', error);
        item.status = 'failed';
        item.error = error.message;
        showStatus(`Failed to convert ${item.file.name}: ${error.message}`, 'error');
      }
      
      updateQueueDisplay();
    }
  }
  
  isConverting = false;
}

async function convertFile(item) {
  const { file, targetFormat } = item;
  
  // For now, we'll implement basic video/audio conversion
  // In a real implementation, you'd handle different file types differently
  
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    return await convertVideoAudio(file, targetFormat, item);
  } else if (file.type.startsWith('image/')) {
    return await convertImage(file, targetFormat, item);
  } else {
    // For other file types, we'll just create a placeholder
    return await convertGeneric(file, targetFormat, item);
  }
}

async function convertVideoAudio(file, targetFormat, item) {
  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + targetFormat;
  
  // Write input file
  ffmpeg.FS('writeFile', inputName, await fetchFile(file));
  
  // Build FFmpeg command
  let command = ['-i', inputName];
  
  // Add quality settings
  const quality = document.getElementById('qualitySelect').value;
  if (quality === 'high') {
    command.push('-crf', '18');
  } else if (quality === 'medium') {
    command.push('-crf', '23');
  } else {
    command.push('-crf', '28');
  }
  
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

async function convertImage(file, targetFormat, item) {
  // For images, we'll use canvas to convert
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
        a.click();
        
        URL.revokeObjectURL(url);
        resolve(url);
      }, `image/${targetFormat}`);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function convertGeneric(file, targetFormat, item) {
  // For generic files, we'll just create a placeholder
  // In a real implementation, you'd handle different file types appropriately
  
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
  a.click();
  
  URL.revokeObjectURL(url);
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

// Queue management
function updateQueueDisplay() {
  const queueList = document.getElementById('queueList');
  queueList.innerHTML = '';
  
  conversionQueue.forEach((item, index) => {
    const queueItem = document.createElement('div');
    queueItem.className = 'queue-item';
    
    const statusText = item.status === 'pending' ? 'Waiting' :
                     item.status === 'converting' ? 'Converting...' :
                     item.status === 'completed' ? 'Completed' : 'Failed';
    
    const statusColor = item.status === 'completed' ? '#34c759' :
                       item.status === 'failed' ? '#ff3b30' :
                       item.status === 'converting' ? '#007aff' : 'rgba(255,255,255,0.6)';
    
    queueItem.innerHTML = `
      <div class="queue-item-info">
        <div class="queue-item-name">${item.file.name}</div>
        <div class="queue-item-status" style="color: ${statusColor}">${statusText}</div>
      </div>
      <div class="queue-item-progress">
        <div class="queue-item-progress-fill" style="width: ${item.progress}%"></div>
      </div>
      <div class="queue-item-actions">
        ${item.status === 'failed' ? 
          `<button class="queue-item-btn" onclick="retryQueueItem(${index})">Retry</button>` : ''}
        <button class="queue-item-btn danger" onclick="removeFromQueue(${index})">Remove</button>
      </div>
    `;
    
    queueList.appendChild(queueItem);
  });
}

// Make queue functions global
window.removeFromQueue = function(index) {
  conversionQueue.splice(index, 1);
  updateQueueDisplay();
};

window.retryQueueItem = function(index) {
  const item = conversionQueue[index];
  item.status = 'pending';
  item.progress = 0;
  item.startTime = null;
  item.endTime = null;
  updateQueueDisplay();
};

function setupQueueControls() {
  document.getElementById('startQueueBtn').addEventListener('click', function() {
    if (!isConverting) {
      processQueue();
    }
  });
  
  document.getElementById('clearQueueBtn').addEventListener('click', function() {
    conversionQueue = [];
    updateQueueDisplay();
  });
  
  document.getElementById('pauseQueueBtn').addEventListener('click', function() {
    // Pause functionality would be implemented here
    showStatus('Pause functionality coming soon', 'info');
  });
}

// History management
function addToHistory(item) {
  const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  
  const historyItem = {
    fileName: item.file.name,
    targetFormat: item.targetFormat,
    tool: item.tool,
    timestamp: Date.now(),
    fileSize: item.file.size,
    conversionTime: item.endTime - item.startTime
  };
  
  history.unshift(historyItem);
  
  // Keep only last 50 items
  if (history.length > 50) {
    history.splice(50);
  }
  
  localStorage.setItem('conversionHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function loadHistory() {
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  
  historyList.innerHTML = '';
  
  history.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const toolConfig = toolConfigs[item.tool];
    const toolName = toolConfig ? toolConfig.name : 'Unknown Tool';
    
    historyItem.innerHTML = `
      <div class="history-item-info">
        <div class="history-item-name">${item.fileName}</div>
        <div class="history-item-details">
          ${toolName} • ${item.targetFormat.toUpperCase()} • ${formatFileSize(item.fileSize)} • ${formatTime(item.timestamp)}
        </div>
      </div>
      <button class="history-item-download" onclick="downloadHistoryItem(${index})">Download</button>
    `;
    
    historyList.appendChild(historyItem);
  });
}

document.getElementById('clearHistoryBtn').addEventListener('click', function() {
  localStorage.removeItem('conversionHistory');
  updateHistoryDisplay();
  showStatus('History cleared', 'success');
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function downloadHistoryItem(index) {
  // This would re-download the converted file
  // For now, we'll just show a message
  showStatus('Download functionality coming soon', 'info');
}

// Advanced settings
function setupAdvancedSettings() {
  const advancedToggle = document.getElementById('advancedToggle');
  const advancedOptions = document.getElementById('advancedOptions');
  
  advancedToggle.addEventListener('click', function() {
    advancedOptions.classList.toggle('show');
  });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + O to open file dialog
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      document.getElementById('fileInput').click();
    }
    
    // Escape to go back to tools
    if (e.key === 'Escape' && document.getElementById('converterInterface').style.display !== 'none') {
      document.getElementById('backToTools').click();
    }
  });
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

// Statistics
function loadStats() {
  const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
  const totalConversions = history.length;
  const totalTimeSaved = history.reduce((sum, item) => sum + (item.conversionTime || 0), 0);
  const averageTime = totalConversions > 0 ? totalTimeSaved / totalConversions : 0;
  
  // You could display these stats somewhere in the UI
  console.log(`Total conversions: ${totalConversions}`);
  console.log(`Total time saved: ${formatTime(totalTimeSaved)}`);
  console.log(`Average conversion time: ${formatTime(averageTime)}`);
}

// Helper function to format time in milliseconds
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
