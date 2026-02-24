let cropper = null;
let currentFile = null;
let croppedBlob = null;
let selectedPerformance = null;
let termsAccepted = false;

// Get DOM elements
const fileInput = document.getElementById('fileInput');
const performanceSelect = document.getElementById('performanceSelect');
const termsCheckbox = document.getElementById('termsCheckbox');
const choosePhotoBtn = document.getElementById('choosePhotoBtn');
const uploadSection = document.getElementById('uploadSection');
const cropSection = document.getElementById('cropSection');
const confirmSection = document.getElementById('confirmSection');
const successSection = document.getElementById('successSection');
const cropImage = document.getElementById('cropImage');
const previewImage = document.getElementById('previewImage');
const cropPerformance = document.getElementById('cropPerformance');
const confirmPerformance = document.getElementById('confirmPerformance');
const previewBtn = document.getElementById('previewBtn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const backBtn = document.getElementById('backBtn');
const newPhotoBtn = document.getElementById('newPhotoBtn');
const uploadStatus = document.getElementById('uploadStatus');
const cropStatus = document.getElementById('cropStatus');
const confirmStatus = document.getElementById('confirmStatus');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Fetch performances from server and populate dropdown
async function loadPerformances() {
  try {
    const response = await fetch('/performances');
    const performances = await response.json();
    
    performances.forEach(perf => {
      const option = document.createElement('option');
      option.value = perf.id;
      option.textContent = perf.display;
      performanceSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load performances:', error);
    showStatus(uploadStatus, 'Failed to load performance dates', 'error');
  }
}

// Check if both requirements are met to enable photo selection
function checkRequirements() {
  if (selectedPerformance && termsAccepted) {
    choosePhotoBtn.disabled = false;
  } else {
    choosePhotoBtn.disabled = true;
  }
}

// Enable photo selection when performance is chosen
performanceSelect.addEventListener('change', function() {
  if (this.value) {
    selectedPerformance = this.value;
  } else {
    selectedPerformance = null;
  }
  checkRequirements();
});

// Enable photo selection when terms are accepted
termsCheckbox.addEventListener('change', function() {
  termsAccepted = this.checked;
  checkRequirements();
});

// Load performances on page load
loadPerformances();

// Handle file selection
fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  
  if (!file) return;

  // Validate file type
  if (!file.type.match('image.*')) {
    showStatus(uploadStatus, 'Please select an image file', 'error');
    return;
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    showStatus(uploadStatus, 'File is too large. Maximum size is 10MB', 'error');
    return;
  }

  currentFile = file;
  loadImageForCropping(file);
});

// Load image and initialize cropper
function loadImageForCropping(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    cropImage.src = e.target.result;
    
    // Get selected performance display text
    const selectedOption = performanceSelect.options[performanceSelect.selectedIndex];
    const performanceText = selectedOption.textContent;
    
    // Show crop section
    uploadSection.style.display = 'none';
    cropSection.style.display = 'block';
    
    // Update subtitle with performance
    cropPerformance.textContent = `Performance: ${performanceText}`;
    confirmPerformance.textContent = `Performance: ${performanceText}`;
    
    // Initialize cropper after image loads
    cropImage.onload = function() {
      if (cropper) {
        cropper.destroy();
      }
      
      cropper = new Cropper(cropImage, {
        aspectRatio: 480 / 640, // 3:4 ratio
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    };
  };
  
  reader.readAsDataURL(file);
}

// Handle preview button
previewBtn.addEventListener('click', async function() {
  if (!cropper) return;

  previewBtn.disabled = true;

  try {
    // Get cropped canvas
    const canvas = cropper.getCroppedCanvas({
      width: 480,
      height: 640,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    // Convert canvas to blob and data URL
    canvas.toBlob(async (blob) => {
      croppedBlob = blob;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        
        // Switch to confirm section
        cropSection.style.display = 'none';
        confirmSection.style.display = 'block';
        
        previewBtn.disabled = false;
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);

  } catch (error) {
    console.error('Preview error:', error);
    showStatus(cropStatus, 'Failed to preview image', 'error');
    previewBtn.disabled = false;
  }
});

// Handle back button
backBtn.addEventListener('click', function() {
  confirmSection.style.display = 'none';
  cropSection.style.display = 'block';
  croppedBlob = null;
});

// Handle crop and submit
submitBtn.addEventListener('click', async function() {
  if (!croppedBlob || !selectedPerformance) return;

  submitBtn.disabled = true;
  backBtn.disabled = true;
  progressBar.style.display = 'block';
  progressFill.style.width = '30%';

  try {
    // Create form data
    const formData = new FormData();
    formData.append('photo', croppedBlob, currentFile.name);
    formData.append('performance', selectedPerformance);

    progressFill.style.width = '70%';

    // Upload to server
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    progressFill.style.width = '90%';

    const result = await response.json();

    if (response.ok) {
      progressFill.style.width = '100%';
      
      // Show success
      setTimeout(() => {
        confirmSection.style.display = 'none';
        successSection.style.display = 'block';
      }, 500);
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    showStatus(confirmStatus, `Upload failed: ${error.message}`, 'error');
    submitBtn.disabled = false;
    backBtn.disabled = false;
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
  }
});

// Handle cancel
cancelBtn.addEventListener('click', function() {
  resetApp();
});

// Handle new photo
newPhotoBtn.addEventListener('click', function() {
  resetApp();
});

// Reset app to initial state
function resetApp() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  
  currentFile = null;
  croppedBlob = null;
  selectedPerformance = null;
  termsAccepted = false;
  fileInput.value = '';
  cropImage.src = '';
  previewImage.src = '';
  performanceSelect.value = '';
  termsCheckbox.checked = false;
  choosePhotoBtn.disabled = true;
  
  uploadSection.style.display = 'block';
  cropSection.style.display = 'none';
  confirmSection.style.display = 'none';
  successSection.style.display = 'none';
  
  submitBtn.disabled = false;
  backBtn.disabled = false;
  previewBtn.disabled = false;
  progressBar.style.display = 'none';
  progressFill.style.width = '0%';
  
  hideStatus(uploadStatus);
  hideStatus(cropStatus);
  hideStatus(confirmStatus);
}

// Show status message
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message ${type}`;
  element.style.display = 'block';
}

// Hide status message
function hideStatus(element) {
  element.style.display = 'none';
}
