import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link, Trash } from 'lucide-react'

const SharedFile = {
  id: "123abc456def",
  name: "Vacation_Photos.zip",
  link: "https://example.com/shared/123abc456def",
  expiryDate: "2024-12-31T23:59:59Z",
  downloads: 100,
  downloadsLeft: 75
};


export function PublicShareBlock() {
  const handleDelete = (id) => {
    // Implement delete logic here
    console.log('Deleting file with id:', id)
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Downloads Left</TableHead>
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
                  <TableCell>
                    <a href={file.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                      <Link className="h-4 w-4 mr-1" />
                      Share Link
                    </a>
                  </TableCell>
                  <TableCell>{file.expiryDate}</TableCell>
                  <TableCell>{file.downloads}</TableCell>
                  <TableCell>{file.downloadsLeft}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
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

