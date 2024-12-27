import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminFilesBlock({ searchQuery }) {
  const [files, setFiles] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    // Fetch files from API
    // For now, we'll use dummy data
    setFiles([
      { id: '1', name: 'document.pdf', uploader: 'John Doe', uploadedAt: '2023-03-01', size: '1.2 MB', viewUsers: ['user1@example.com'], downloadUsers: ['user2@example.com'] },
      { id: '2', name: 'image.jpg', uploader: 'Jane Smith', uploadedAt: '2023-03-15', size: '3.5 MB', viewUsers: ['user3@example.com'], downloadUsers: ['user4@example.com'] },
    ]);
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredFiles = sortedFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewFile = (fileId) => {
    // Implement file view logic here
    console.log('Viewing file:', fileId);
  };

  const handleDownloadFile = (fileId) => {
    // Implement file download logic here
    console.log('Downloading file:', fileId);
  };

  const handleDeleteFile = (fileId) => {
    // Implement file deletion logic here
    console.log('Deleting file:', fileId);
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      // Implement save edit logic here
      console.log('Saving edits for file:', editingFile.id);
      setFiles(files.map(file => file.id === editingFile.id ? editingFile : file));
      setEditingFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name</TableHead>
              <TableHead onClick={() => handleSort('uploader')} className="cursor-pointer">Uploader</TableHead>
              <TableHead onClick={() => handleSort('uploadedAt')} className="cursor-pointer">Uploaded At</TableHead>
              <TableHead onClick={() => handleSort('size')} className="cursor-pointer">Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{file.uploader}</TableCell>
                  <TableCell>{file.uploadedAt}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewFile(file.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadFile(file.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditFile(file)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit File Permissions</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="viewUsers" className="text-right">
                                View Users
                              </Label>
                              <Input
                                id="viewUsers"
                                value={editingFile?.viewUsers.join(', ')}
                                onChange={(e) => setEditingFile(prev => prev ? {...prev, viewUsers: e.target.value.split(', ')} : null)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="downloadUsers" className="text-right">
                                Download Users
                              </Label>
                              <Input
                                id="downloadUsers"
                                value={editingFile?.downloadUsers.join(', ')}
                                onChange={(e) => setEditingFile(prev => prev ? {...prev, downloadUsers: e.target.value.split(', ')} : null)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <Button onClick={handleSaveEdit}>Save Changes</Button>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
