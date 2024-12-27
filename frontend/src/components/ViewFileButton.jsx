import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import SecureFileCrypto from "@/utils/crypto";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export function ViewFileButton({ fileId, fileType, fileName }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleView = async () => {
    setIsLoading(true);
    try {
      
      const blob = await SecureFileCrypto.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setIsViewerOpen(true);
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Failed to load the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileViewer = () => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-[80vh]" title={fileName} />;
      case "mp3":
      case "wav":
        return <audio controls src={fileUrl} className="w-full" controlsList="nodownload" />;
      case "mp4":
        return <video controls src={fileUrl} className="w-full max-h-[80vh]" controlsList="nodownload" />;
      case "jpg":
      case "png":
      case "gif":
        return (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[80vh] object-contain"
            style={{ pointerEvents: "none", userSelect: "none" }}
            draggable={false}
          />
        );
      default:
        return <iframe src={fileUrl} className="w-full h-[80vh]" title={fileName} />;
    }
  };

  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        disabled={isLoading}
        className="text-blue-600 hover:text-blue-800 border-blue-600 hover:bg-blue-100"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
      </Button>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent
          className="max-w-4xl w-full"
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none" }}
        >
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
          </DialogHeader>
          {renderFileViewer()}
        </DialogContent>
      </Dialog>
    </>
  );
}
