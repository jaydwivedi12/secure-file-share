import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Clipboard, Share2, X } from 'lucide-react'; 
import api from '@/services/apiConfig';
import { toast } from 'react-toastify';


export function ShareFileButton({ fileId, fileName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleShare = async () => {
    setIsLoading(true);
    try {

      if(!expiryDate || maxDownloads < 1) {
        toast.error('Invalid Date or Max Download');
        return;
      }
      const response = await api.post(`/file/generate-share-url/${fileId}/`,
      { expiryDate, maxDownloads }
      );
      
     const data=response.data
      
      if (response.status==200) {
        setShareLink(data.share_url);
        toast.success("Successfully created");
      } else {
        toast.error('Failed to generate share URL');
        console.error('Failed to share file');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate share URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleOutsideClick = (e) => {
    // Close the modal if clicked outside the modal box
    if (e.target.id === 'modal-background') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-green-600 hover:text-green-800 border-green-600 hover:bg-green-100"
      >
        <Share2 className="h-4 w-4 mr-1" />
      </Button>

      {isOpen && (
        <div
          id="modal-background"
          onClick={handleOutsideClick}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-64 max-w-xs">
            {/* Close button in top right corner */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col gap-3">
              {/* Display File Name */}
              <div className="text-lg font-semibold text-gray-800 mb-3">
                Sharing: {fileName}
              </div>

              {/* Date Picker */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate || ''}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>

              {/* Max Downloads */}
              <div>
                <label htmlFor="maxDownloads" className="block text-sm font-medium text-gray-700">
                  Max Downloads
                </label>
                <input
                  type="number"
                  id="maxDownloads"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  min="1"
                />
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                isLoading={isLoading}  
                loadingText="Sharing..."  
                className="w-full mt-3 bg-black text-white"
              >
                Share
              </Button>

              {/* Link and Copy Option */}
              {shareLink && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Link: {shareLink}</span>
                    <button
                      onClick={handleCopyLink}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Clipboard className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
