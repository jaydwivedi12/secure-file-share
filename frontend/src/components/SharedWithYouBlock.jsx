'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download } from 'lucide-react'
import { ViewFileButton } from './ViewFileButton'
import { DownloadFileButton } from './DownloadFileButton'

const mockSharedFiles = [
  { id: '1', name: 'shared_doc.pdf', sharedDate: '2023-05-10', size: '3.2 MB', type: 'PDF', permission: 'view' },
  { id: '2', name: 'shared_image.png', sharedDate: '2023-05-12', size: '1.5 MB', type: 'PNG', permission: 'download' },
  { id: '3', name: 'shared_audio.mp3', sharedDate: '2023-05-14', size: '4.7 MB', type: 'MP3', permission: 'view' },
]

export function SharedWithYouBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-serif bg-purple-100 p-4 rounded-lg">Files Shared With You</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Shared Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSharedFiles.map((file, index) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{file.sharedDate}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.type}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <ViewFileButton fileId={file.id} fileType={file.type} />
                      {file.permission === 'download' && (
                        <DownloadFileButton fileId={file.id} fileName={file.name} />
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
