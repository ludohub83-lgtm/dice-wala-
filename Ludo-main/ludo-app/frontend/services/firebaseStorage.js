// Firebase Storage service for file uploads
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload payment screenshot
export const uploadPaymentScreenshot = async (userId, file, transactionId) => {
  try {
    // Create a reference to the file location
    const fileName = `payments/${userId}/${transactionId}_${Date.now()}.${file.uri.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    
    // Convert file to blob
    let blob;
    if (file.uri) {
      // For React Native
      const response = await fetch(file.uri);
      blob = await response.blob();
    } else if (file instanceof Blob) {
      // For web
      blob = file;
    } else {
      throw new Error('Invalid file format');
    }
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      success: true,
      url: downloadURL,
      path: fileName
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

// Upload QR code image
export const uploadQRCode = async (file) => {
  try {
    const fileName = `admin/qr-code_${Date.now()}.${file.uri ? file.uri.split('.').pop() : 'png'}`;
    const storageRef = ref(storage, fileName);
    
    let blob;
    if (file.uri) {
      const response = await fetch(file.uri);
      blob = await response.blob();
    } else if (file instanceof Blob) {
      blob = file;
    } else {
      throw new Error('Invalid file format');
    }
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      success: true,
      url: downloadURL,
      path: fileName
    };
  } catch (error) {
    console.error('Upload QR code error:', error);
    throw new Error(error.message || 'Failed to upload QR code');
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error(error.message || 'Failed to delete file');
  }
};

