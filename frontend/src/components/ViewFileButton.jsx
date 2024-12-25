import { Button } from "@/components/ui/button"
import { Eye } from 'lucide-react'

export function ViewFileButton({ fileId, fileType }) {
  const handleView = () => {
    // Implement file viewing logic here based on fileType
    console.log(`Viewing file: ${fileId}, type: ${fileType}`)
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        console.log('Opening PDF viewer')
        // Implement PDF viewer logic
        break
      case 'mp3':
      case 'wav':
        console.log('Playing audio')
        // Implement audio player logic
        break
      case 'mp4':
        console.log('Playing video')
        // Implement video player logic
        break
      case 'jpg':
      case 'png':
      case 'gif':
        console.log('Opening image viewer')
        // Implement image viewer logic
        break
      default:
        console.log('Opening default file viewer')
        // Implement default file viewer logic
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleView} className="text-blue-600 hover:text-blue-800 border-blue-600 hover:bg-blue-100">
      <Eye className="h-4 w-4 mr-1" />
    </Button>
  )
}
