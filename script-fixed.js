// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Vidter initializing...');

  // Get all DOM elements
  const uploader = document.getElementById('uploader');
  const fileInput = document.getElementById('fileInput');
  const selectedText = document.getElementById('selectedFiles');
  const filehint = document.getElementById('filehint');
  const convertBtn = document.getElementById('convertBtn');
  const formatList = document.getElementById('formatList');
  const chosen = document.getElementById('chosen');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const statusMessage = document.getElementById('statusMessage');
  const filePreview = document.getElementById('filePreview');
  const settingsPanel = document.getElementById('settingsPanel');
  const qualitySelect = document.getElementById('qualitySelect');
  const audioBitrateSelect = document.getElementById('audioBitrateSelect');
  const queuePanel = document.getElementById('queuePanel');
  const queueList = document.getElementById('queueList');
  const startQueueBtn = document.getElementById('startQueueBtn');
  const pauseQueueBtn = document.getElementById('pauseQueueBtn');
  const clearQueueBtn = document.getElementById('clearQueueBtn');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const advancedToggle = document.getElementById('advancedToggle');
  const advancedOptions = document.getElementById('advancedOptions');
  const videoResolution = document.getElementById('videoResolution');
  const frameRate = document.getElementById('frameRate');
  const videoBitrate = document.getElementById('videoBitrate');

  // Check if all elements exist
  const requiredElements = {
    uploader, fileInput, selectedText, filehint, convertBtn, formatList, chosen,
    progressContainer, progressFill, progressText, statusMessage, filePreview,
    settingsPanel, qualitySelect, audioBitrateSelect, queuePanel, queueList,
    startQueueBtn, pauseQueueBtn, clearQueueBtn, historyPanel, historyList,
    clearHistoryBtn, advancedToggle, advancedOptions, videoResolution,
    frameRate, videoBitrate
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error('Missing elements:', missingElements);
    showStatus(`Error: Missing elements: ${missingElements.join(', ')}`, 'error');
    return;
  }

  // State variables
  let files = [];
  let targetFormat = null;
  let ffmpeg = null;
  let conversionQueue = [];
  let isQueueRunning = false;
  let isQueuePaused = false;
  let conversionHistory = [];
  let stats = {
    totalConversions: 0,
    totalFilesProcessed: 0,
    totalTimeSaved: 0,
    averageConversionTime: 0
  };

  // Configuration
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const MAX_FILES = 10;
  const MAX_HISTORY = 50;

  // Initialize FFmpeg
  async function initFFmpeg() {
    try {
      showStatus('Initializing video converter... This may take a moment.', 'info');
      
      // Check if FFmpeg is available
      if (typeof createFFmpeg === 'undefined') {
        throw new Error('FFmpeg.wasm not loaded. Please check your internet connection.');
      }
      
      ffmpeg = createFFmpeg({ 
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js'
      });
      
      // Show progress during loading
      ffmpeg.setProgress(({ ratio }) => {
        if (ratio < 1) {
          showStatus(`Loading FFmpeg... ${Math.round(ratio * 100)}%`, 'info');
        }
      });
      
      await ffmpeg.load();
      console.log('FFmpeg loaded successfully');
      showStatus('Video converter ready! You can now convert files.', 'success');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        hideStatus();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      showStatus(`Failed to initialize video converter: ${error.message}`, 'error');
    }
  }

  // Initialize everything
  async function initialize() {
    try {
      await initFFmpeg();
      loadHistory();
      setupQueueControls();
      setupAdvancedSettings();
      setupKeyboardShortcuts();
      loadStats();
      setupEventListeners();
      console.log('Vidter initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      showStatus('Failed to initialize application', 'error');
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Drag and drop
    ['dragenter', 'dragover'].forEach(evt => {
      uploader.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        uploader.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(evt => {
      uploader.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        uploader.classList.remove('dragover');
      }, false);
    });

    uploader.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      if (!dt) return;
      const dropped = Array.from(dt.files || []);
      handleFiles(dropped);
    });

    // File input
    fileInput.addEventListener('change', e => {
      handleFiles(Array.from(e.target.files || []));
      fileInput.value = ''; // reset to allow same file again
    });

    // Convert button
    convertBtn.addEventListener('click', () => {
      const open = formatList.style.display === 'none';
      formatList.style.display = open ? 'block' : 'none';
      convertBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Format selection
    document.querySelectorAll('.format-card').forEach(card => {
      card.addEventListener('click', async () => {
        targetFormat = card.dataset.format;
        chosen.textContent = `Selected: ${targetFormat.toUpperCase()}`;
        formatList.style.display = 'none';

        if (files.length === 0) {
          showStatus('No files selected. Please drag & drop or browse files first.', 'error');
          return;
        }

        if (!ffmpeg || !ffmpeg.isLoaded()) {
          showStatus('Video converter is still initializing. Please wait for the "Video converter ready!" message.', 'error');
          return;
        }

        // Add files to queue
        addToQueue(files, targetFormat);
        showStatus(`${files.length} file(s) added to conversion queue. Click "Start All" to begin.`, 'success');
        
        // Reset file selection
        files = [];
        updateFilePreview();
        updateFileList();
      });
    });

    // Close format list when clicking outside
    document.addEventListener('click', (e) => {
      if (formatList.style.display !== 'none' && !convertBtn.contains(e.target) && !formatList.contains(e.target)) {
        formatList.style.display = 'none';
        convertBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Update convert button when FFmpeg is ready
  function updateConvertButton() {
    if (ffmpeg && ffmpeg.isLoaded()) {
      convertBtn.textContent = 'Convert file ▾';
      convertBtn.disabled = false;
    } else {
      convertBtn.textContent = 'Loading converter...';
      convertBtn.disabled = true;
    }
  }

  // Check FFmpeg status periodically
  setInterval(updateConvertButton, 1000);

  // File handling
  function handleFiles(list) {
    if (list.length === 0) return;
    
    // Check file count limit
    if (files.length + list.length > MAX_FILES) {
      showStatus(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`, 'error');
      return;
    }
    
    // Validate file types and sizes
    const validTypes = ['video/', 'audio/'];
    const validFiles = [];
    const invalidFiles = [];
    
    list.forEach(file => {
      const isValidType = validTypes.some(type => file.type.startsWith(type));
      const isValidSize = file.size <= MAX_FILE_SIZE;
      
      if (isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          name: file.name,
          reason: !isValidType ? 'Invalid file type' : 'File too large'
        });
      }
    });
    
    if (validFiles.length === 0) {
      showStatus('No valid files found. Please select video/audio files under 500MB.', 'error');
      return;
    }
    
    if (invalidFiles.length > 0) {
      const reasons = invalidFiles.map(f => `${f.name} (${f.reason})`).join(', ');
      showStatus(`Some files were skipped: ${reasons}`, 'error');
    }
    
    // Add new files to existing ones
    files = [...files, ...validFiles];
    
    // Update UI
    updateFilePreview();
    updateFileList();
    hideStatus();
  }

  function updateFileList() {
    if (files.length === 0) {
      selectedText.textContent = '';
      filehint.style.display = 'block';
      settingsPanel.style.display = 'none';
    } else {
      const names = files.map(f => f.name);
      selectedText.textContent = names.join(', ');
      filehint.style.display = 'none';
      settingsPanel.style.display = 'block';
    }
    chosen.textContent = targetFormat ? `Selected: ${targetFormat.toUpperCase()}` : '';
  }

  function updateFilePreview() {
    filePreview.innerHTML = '';
    
    files.forEach((file, index) => {
      const fileCard = document.createElement('div');
      fileCard.className = 'file-card';
      
      const isVideo = file.type.startsWith('video/');
      const fileSize = formatFileSize(file.size);
      const formatSuggestion = suggestFormat(file);
      
      fileCard.innerHTML = `
        <button class="file-remove" onclick="removeFile(${index})">×</button>
        <div class="file-thumbnail">
          ${isVideo ? '🎥' : '🎵'}
        </div>
        <div class="file-name">${file.name}</div>
        <div class="file-size">${fileSize}</div>
        ${formatSuggestion ? `<div class="format-suggestion">${formatSuggestion}</div>` : ''}
      `;
      
      filePreview.appendChild(fileCard);
    });
  }

  // Make removeFile global
  window.removeFile = function(index) {
    files.splice(index, 1);
    updateFilePreview();
    updateFileList();
  };

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Queue Management
  function setupQueueControls() {
    startQueueBtn.addEventListener('click', startQueue);
    pauseQueueBtn.addEventListener('click', pauseQueue);
    clearQueueBtn.addEventListener('click', clearQueue);
    clearHistoryBtn.addEventListener('click', clearHistory);
  }

  function addToQueue(fileList, format) {
    fileList.forEach(file => {
      const queueItem = {
        id: Date.now() + Math.random(),
        file: file,
        format: format,
        status: 'pending',
        progress: 0,
        error: null,
        startTime: null,
        endTime: null
      };
      conversionQueue.push(queueItem);
    });
    
    updateQueueDisplay();
    queuePanel.style.display = 'block';
  }

  function updateQueueDisplay() {
    queueList.innerHTML = '';
    
    conversionQueue.forEach((item, index) => {
      const queueItem = document.createElement('div');
      queueItem.className = 'queue-item';
      
      const statusText = {
        'pending': 'Waiting',
        'processing': 'Converting',
        'completed': 'Completed',
        'error': 'Failed'
      };
      
      queueItem.innerHTML = `
        <div class="queue-item-status ${item.status}"></div>
        <div class="queue-item-info">
          <div class="queue-item-name">${item.file.name}</div>
          <div class="queue-item-details">${statusText[item.status]} → ${item.format.toUpperCase()}</div>
        </div>
        <div class="queue-item-actions">
          ${item.status === 'pending' ? `<button class="queue-item-btn" onclick="removeFromQueue(${index})">Remove</button>` : ''}
          ${item.status === 'error' ? `<button class="queue-item-btn" onclick="retryQueueItem(${index})">Retry</button>` : ''}
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
    item.error = null;
    item.startTime = null;
    item.endTime = null;
    updateQueueDisplay();
  };

  function startQueue() {
    if (isQueueRunning) return;
    
    isQueueRunning = true;
    isQueuePaused = false;
    startQueueBtn.textContent = 'Running...';
    startQueueBtn.disabled = true;
    pauseQueueBtn.disabled = false;
    
    processQueue();
  }

  function pauseQueue() {
    isQueuePaused = !isQueuePaused;
    pauseQueueBtn.textContent = isQueuePaused ? 'Resume' : 'Pause';
  }

  function clearQueue() {
    conversionQueue = [];
    updateQueueDisplay();
    queuePanel.style.display = 'none';
    isQueueRunning = false;
    isQueuePaused = false;
    startQueueBtn.textContent = 'Start All';
    startQueueBtn.disabled = false;
    pauseQueueBtn.disabled = true;
  }

  async function processQueue() {
    while (conversionQueue.length > 0 && isQueueRunning && !isQueuePaused) {
      const pendingItems = conversionQueue.filter(item => item.status === 'pending');
      
      if (pendingItems.length === 0) {
        break;
      }
      
      const item = pendingItems[0];
      item.status = 'processing';
      item.startTime = new Date();
      updateQueueDisplay();
      
      try {
        const result = await convertSingleFile(item.file, item.format);
        item.status = 'completed';
        item.endTime = new Date();
        
        // Add to history and update stats
        const conversionTime = Math.round((item.endTime - item.startTime) / 1000);
        addToHistory(item.file.name, item.format, result.filename, item.startTime, item.endTime);
        updateStats(conversionTime);
        
        // Download file
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        item.status = 'error';
        item.error = error.message;
        item.endTime = new Date();
        console.error('Queue conversion error:', error);
      }
      
      updateQueueDisplay();
      
      // Remove completed/error items after a delay
      setTimeout(() => {
        conversionQueue = conversionQueue.filter(item => item.status === 'pending' || item.status === 'processing');
        updateQueueDisplay();
      }, 3000);
    }
    
    if (conversionQueue.length === 0) {
      isQueueRunning = false;
      startQueueBtn.textContent = 'Start All';
      startQueueBtn.disabled = false;
      pauseQueueBtn.disabled = true;
      queuePanel.style.display = 'none';
    }
  }

  // History Management
  function addToHistory(fileName, format, outputName, startTime, endTime) {
    const historyItem = {
      id: Date.now(),
      fileName: fileName,
      format: format,
      outputName: outputName,
      startTime: startTime,
      endTime: endTime,
      duration: Math.round((endTime - startTime) / 1000)
    };
    
    conversionHistory.unshift(historyItem);
    
    // Keep only recent items
    if (conversionHistory.length > MAX_HISTORY) {
      conversionHistory = conversionHistory.slice(0, MAX_HISTORY);
    }
    
    saveHistory();
    updateHistoryDisplay();
  }

  function updateHistoryDisplay() {
    if (conversionHistory.length === 0) {
      historyPanel.style.display = 'none';
      return;
    }
    
    historyPanel.style.display = 'block';
    historyList.innerHTML = '';
    
    conversionHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      historyItem.innerHTML = `
        <div class="history-item-icon">✓</div>
        <div class="history-item-info">
          <div class="history-item-name">${item.fileName}</div>
          <div class="history-item-details">${item.format.toUpperCase()} • ${item.duration}s • ${new Date(item.startTime).toLocaleTimeString()}</div>
        </div>
      `;
      
      historyList.appendChild(historyItem);
    });
  }

  function clearHistory() {
    conversionHistory = [];
    saveHistory();
    updateHistoryDisplay();
  }

  function saveHistory() {
    try {
      localStorage.setItem('vidter_history', JSON.stringify(conversionHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('vidter_history');
      if (saved) {
        conversionHistory = JSON.parse(saved);
        updateHistoryDisplay();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  // Advanced Settings Management
  function setupAdvancedSettings() {
    advancedToggle.addEventListener('click', () => {
      const isVisible = advancedOptions.classList.contains('show');
      advancedOptions.classList.toggle('show');
      advancedToggle.textContent = isVisible ? 'Advanced Settings' : 'Hide Advanced Settings';
    });
  }

  // Keyboard Shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + O to open file browser
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInput.click();
      }
      
      // Ctrl/Cmd + Enter to start conversion if format is selected
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && targetFormat && files.length > 0) {
        e.preventDefault();
        addToQueue(files, targetFormat);
      }
      
      // Escape to close format list
      if (e.key === 'Escape' && formatList.style.display !== 'none') {
        formatList.style.display = 'none';
        convertBtn.setAttribute('aria-expanded', 'false');
      }
      
      // ? to show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        showShortcutsHelp();
      }
    });
  }

  function showShortcutsHelp() {
    const shortcutsHTML = `
      <div class="shortcuts-panel">
        <div class="shortcuts-header">
          <div class="shortcuts-title">Keyboard Shortcuts</div>
          <button class="shortcuts-close" onclick="hideShortcutsHelp()">×</button>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-action">Open file browser</span>
          <span class="shortcut-key">Ctrl+O</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-action">Start conversion</span>
          <span class="shortcut-key">Ctrl+Enter</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-action">Close format list</span>
          <span class="shortcut-key">Esc</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-action">Show this help</span>
          <span class="shortcut-key">?</span>
        </div>
      </div>
      <div class="overlay" onclick="hideShortcutsHelp()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', shortcutsHTML);
    document.querySelector('.shortcuts-panel').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
  }

  window.hideShortcutsHelp = function() {
    const shortcutsPanel = document.querySelector('.shortcuts-panel');
    const overlay = document.querySelector('.overlay');
    if (shortcutsPanel) shortcutsPanel.remove();
    if (overlay) overlay.remove();
  };

  // Statistics Management
  function loadStats() {
    try {
      const saved = localStorage.getItem('vidter_stats');
      if (saved) {
        stats = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  function saveStats() {
    try {
      localStorage.setItem('vidter_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  function updateStats(conversionTime) {
    stats.totalConversions++;
    stats.totalFilesProcessed++;
    stats.totalTimeSaved += conversionTime;
    stats.averageConversionTime = stats.totalTimeSaved / stats.totalConversions;
    saveStats();
  }

  // File Format Detection and Suggestions
  function detectFileFormat(file) {
    const extension = getFileExtension(file.name).toLowerCase();
    const mimeType = file.type;
    
    const formatMap = {
      'mp4': ['mp4', 'm4v', 'mov'],
      'webm': ['webm'],
      'avi': ['avi'],
      'mov': ['mov', 'qt'],
      'mp3': ['mp3', 'wav', 'aac', 'ogg', 'flac']
    };
    
    for (const [format, extensions] of Object.entries(formatMap)) {
      if (extensions.includes(extension)) {
        return format;
      }
    }
    
    // Fallback based on MIME type
    if (mimeType.startsWith('video/')) {
      return 'mp4'; // Default video format
    } else if (mimeType.startsWith('audio/')) {
      return 'mp3'; // Default audio format
    }
    
    return null;
  }

  function suggestFormat(file) {
    const detectedFormat = detectFileFormat(file);
    if (detectedFormat) {
      return `Suggested format: ${detectedFormat.toUpperCase()}`;
    }
    return null;
  }

  // Conversion functions
  async function convertSingleFile(file, format) {
    if (!ffmpeg || !ffmpeg.isLoaded()) {
      throw new Error('FFmpeg not initialized');
    }

    const inputName = `input_${Date.now()}.${getFileExtension(file.name)}`;
    const outputName = `output_${Date.now()}.${format}`;
    
    // Write file to FFmpeg
    ffmpeg.FS('writeFile', inputName, await file.arrayBuffer());
    
    // Get quality settings
    const quality = qualitySelect.value;
    const audioBitrate = audioBitrateSelect.value;
    
    // Get advanced settings if available
    const resolution = videoResolution.value || '1920x1080';
    const fps = frameRate.value || '30';
    const videoBitrateValue = videoBitrate.value || '2';
    
    // Build FFmpeg command based on format and quality settings
    let command = [];
    
    if (format === 'mp3') {
      command = ['-i', inputName, '-vn', '-acodec', 'mp3', '-ab', `${audioBitrate}k`, outputName];
    } else if (format === 'mp4') {
      const videoSettings = getVideoSettings(quality);
      command = [
        '-i', inputName, 
        '-c:v', 'libx264', 
        '-preset', videoSettings.preset,
        '-crf', videoSettings.crf,
        '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease`,
        '-r', fps,
        '-c:a', 'aac', 
        '-b:a', `${audioBitrate}k`,
        outputName
      ];
    } else if (format === 'webm') {
      const videoSettings = getVideoSettings(quality);
      command = [
        '-i', inputName, 
        '-c:v', 'libvpx-vp9', 
        '-crf', videoSettings.crf,
        '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease`,
        '-r', fps,
        '-b:v', videoSettings.bitrate,
        '-c:a', 'libopus', 
        '-b:a', `${audioBitrate}k`,
        outputName
      ];
    } else if (format === 'mov') {
      const videoSettings = getVideoSettings(quality);
      command = [
        '-i', inputName, 
        '-c:v', 'libx264', 
        '-preset', videoSettings.preset,
        '-crf', videoSettings.crf,
        '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease`,
        '-r', fps,
        '-c:a', 'aac', 
        '-b:a', `${audioBitrate}k`,
        '-f', 'mov', 
        outputName
      ];
    } else if (format === 'avi') {
      const videoSettings = getVideoSettings(quality);
      command = [
        '-i', inputName, 
        '-c:v', 'libx264', 
        '-preset', videoSettings.preset,
        '-crf', videoSettings.crf,
        '-vf', `scale=${resolution}:force_original_aspect_ratio=decrease`,
        '-r', fps,
        '-c:a', 'mp3', 
        '-b:a', `${audioBitrate}k`,
        outputName
      ];
    }
    
    // Run conversion
    await ffmpeg.run(...command);
    
    // Read result
    const data = ffmpeg.FS('readFile', outputName);
    
    // Clean up
    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputName);
    
    // Create download URL
    const blob = new Blob([data.buffer], { type: getMimeType(format) });
    const url = URL.createObjectURL(blob);
    
    const filename = file.name.replace(/\.[^/.]+$/, '') + '.' + format;
    
    return { url, filename };
  }

  function getVideoSettings(quality) {
    switch (quality) {
      case 'high':
        return { preset: 'slow', crf: '18', bitrate: '2M' };
      case 'medium':
        return { preset: 'medium', crf: '23', bitrate: '1M' };
      case 'low':
        return { preset: 'fast', crf: '28', bitrate: '500k' };
      default:
        return { preset: 'medium', crf: '23', bitrate: '1M' };
    }
  }

  function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  function getMimeType(format) {
    const mimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mp3': 'audio/mpeg'
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  // Status and notification functions
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    // Show notification for important messages
    if (type === 'success' || type === 'error') {
      showNotification(message, type);
    }
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div style="font-weight:500;margin-bottom:4px;">${type === 'success' ? '✓ Success' : type === 'error' ? '✗ Error' : 'ℹ Info'}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  function hideStatus() {
    statusMessage.style.display = 'none';
  }

  // Add keyboard shortcut hint to footer
  const footer = document.querySelector('footer div');
  if (footer) {
    footer.innerHTML += ' · Press ? for keyboard shortcuts';
  }

  // Initialize the application
  initialize();
});
