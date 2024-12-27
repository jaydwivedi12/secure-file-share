import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ViewFileButton } from '@/components/ViewFileButton'
import { Loader2 } from 'lucide-react'
import api from '@/services/apiConfig'
import formatFileSize from '@/utils/formatFileSize'
import { useParams } from 'react-router'

export default function GuestViewfile() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { link_id } = useParams()

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const response = await api.get(`/file/get-public-share-url-info/${link_id}/`)
        console.log(response);
        
        if (response.data.success) {
          setFiles(response.data.file)
        } else {
          setError('Failed to fetch shared files')
        }
      } catch (err) {
        setError(err.response.data.message)
        console.error('Error fetching shared files:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedFiles()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      className="container mx-auto px-4 py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-serif bg-blue-100 p-4 rounded-lg">Shared File</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Shared By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <motion.tr
                  key={files.file_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <TableCell>{files.file_name}</TableCell>
                  <TableCell>{formatFileSize(files.file_size)}</TableCell>
                  <TableCell>{files.created_by}</TableCell>
                  <TableCell>{new Date(files.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <ViewFileButton fileId={files.file_id} fileName={files.file_name} fileType={files.type} />
                  </TableCell>
                </motion.tr>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
