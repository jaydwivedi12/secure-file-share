import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import SecureFileCrypto from "@/utils/crypto"

export function DownloadFileButton({ fileId, fileName }) {
  const handleDownload = async () => {
    // Implement file download logic here
   
    const blob=await SecureFileCrypto.downloadFile(fileId)
    console.log(blob);
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="text-green-600 hover:text-green-800 border-green-600 hover:bg-green-100">
      <Download className="h-4 w-4 mr-1" />
    </Button>
  )
}

