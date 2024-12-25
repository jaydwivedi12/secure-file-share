import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'


export function DownloadFileButton({ fileId, fileName }) {
  const handleDownload = () => {
    // Implement file download logic here
    console.log(`Downloading file: ${fileId}, name: ${fileName}`)
    
    // Placeholder for actual download logic
    const dummyContent = 'This is a dummy file content'
    const blob = new Blob([dummyContent], { type: 'text/plain' })
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

