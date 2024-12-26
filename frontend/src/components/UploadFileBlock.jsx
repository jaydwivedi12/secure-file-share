import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, File, CheckCircle } from 'lucide-react'

import SecureFileCrypto from '../utils/crypto';
import { toast } from 'react-toastify';
import Loader from './loader'

export function UploadFileBlock() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file to upload.');
      return;
    }

    setUploading(true);
    
    try {
      // Simulating file upload
      await SecureFileCrypto.uploadFile(selectedFile);
      
      setUploading(false);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);  
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('File upload failed. Please try again.');
      setUploading(false);
    }
  }

  return (
    <motion.div 
      className="bg-white p-10 rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-serif mb-8 text-gray-900 bg-blue-100 p-4 rounded-lg">Upload File</h2>
      <div className="space-y-8">
        {uploading ? (
          <Loader />
        ) : (
          <div className="flex items-center justify-center w-full">
            <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-16 h-16 mb-4 text-blue-500" />
                <p className="mb-2 text-xl text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG ,MP3/MP4</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
            </Label>
          </div>
        )}

        <Button 
          onClick={handleFileUpload} 
          disabled={!selectedFile || uploading} 
          className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xl py-8 rounded-xl transition-colors duration-300"
        >
          <Upload className="mr-3 h-6 w-6" />
          Upload File
        </Button>
      </div>
    </motion.div>
  )
}
