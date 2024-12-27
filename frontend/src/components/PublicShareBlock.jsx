
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/services/apiConfig'
import formatFileSize from '@/utils/formatFileSize'
import { toast } from 'react-toastify'

export function PublicShareBlock() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get(`/file/get-user-share-links/`)
        console.log("Fetched files:", response.data) // Debug log

        setFiles(
          response.data.files.map((file) => ({
            link_id: file.link_id,
            file_id: file.file_id,
            name: file.file_name,
            link: `/share/${file.link_id}`,
            size: formatFileSize(file.file_size), // Format the file size for display
            expiryDate: file.expires_at,
            maxDownloads: file.max_downloads,
            downloadCount: file.download_count,
          }))
        )
      } catch (err) {
        console.error("Error fetching files:", err)
        setError("Failed to fetch shared files.")
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  const handleDelete = async (link_id) => {
    const response = await api.delete(`/file/delete_shareable_link/${link_id}/`);
    if (response.status === 200) {
      setFiles(files.filter(file => file.link_id !== link_id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-serif bg-green-100 p-4 rounded-lg">Your Public Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="h-[50vh] overflow-auto bg-white p-4 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Share Link</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Max Download</TableHead>
                <TableHead>Download Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, key) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: key * 0.1 }}
                >
                  <TableCell>{file.name}</TableCell>
                  <TableCell>
                    <a
                      href={file.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      View Link
                    </a>
                  </TableCell>
                  <TableCell>{new Date(file.expiryDate).toLocaleString()}</TableCell>
                  <TableCell>{file.maxDownloads}</TableCell>
                  <TableCell>{file.downloadCount}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file.link_id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
