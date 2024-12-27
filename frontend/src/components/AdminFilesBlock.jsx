import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/apiConfig';
import formatFileSize from '@/utils/formatFileSize';
import { toast } from 'react-toastify';
import { ViewFileButton } from './ViewFileButton';
import { DownloadFileButton } from './DownloadFileButton';
import { ShareFileButton } from './ShareFileButton';
export function AdminFilesBlock({ searchQuery }) {
  const [files, setFiles] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/file/get-all-users-files/')
        if (response.status=== 200) {
          const fetchedFiles = response.data.files.map(file => ({
            id: file.file_id,
            name: file.filename,
            uploader: file.user_email,
            uploadedAt: file.uploaded_at,
            size: formatFileSize(file.file_size),
            type: file.content_type,
            viewUsers:  [], 
            downloadUsers: [],
          }));

          setFiles(fetchedFiles);
        } else {
          console.error('Failed to fetch files:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
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

  const handleDeleteFile = async (fileId) => {
    const response = await api.delete(`/file/delete-file/${fileId}/`);
    if (response.status === 200) {
      setFiles(files.filter(file => file.id !== fileId));
      toast.success("File deleted successfully!");
    } else {
      toast.error("Fail to delete file");
    }
  };

  const handleEditFile = async(file) => {
    const response = await api.get(`/file/get-permissions/${file.id}/`);
    try {
      if (response.data.success) {   
        setEditingFile({
          ...file,
          viewUsers: response.data.view_permission.join(', '),
          downloadUsers: response.data.download_permission.join(', ')
        });
      }
      else{
        setEditingFile({
          ...file,
          viewUsers: '',
          downloadUsers: ''
        });
      }
    } catch (error) {
      console.log(error)
      setEditingFile(null)
    }
  }

  const handleSaveEdit = async () => {
    if (editingFile) {
      const updatedFile = {
        ...editingFile,
        viewUsers: editingFile.viewUsers.split(',').map(email => email.trim()),
        downloadUsers: editingFile.downloadUsers.split(',').map(email => email.trim())
      }
      
      try {
        const response = await api.put(`/file/update-permisssions/${editingFile.id}/`, {
          view_email: updatedFile.viewUsers,
          download_email: updatedFile.downloadUsers
        });
        console.log(response);
        

        if (response.data.success) {
          // Update local state
          setFiles(files.map(file => file.id === editingFile.id ? { ...file, viewUsers: updatedFile.viewUsers, downloadUsers: updatedFile.downloadUsers } : file));
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('Error updating file permissions:', error);
        toast.error('Failed to update file permissions.');
      }

      setEditingFile(null); 
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="h-[50vh] overflow-auto bg-white p-4 rounded-lg shadow-md">
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
                     <ViewFileButton fileId={file.id} fileType={file.type} fileName={file.name} />
                    <DownloadFileButton fileId={file.id} fileName={file.name} />
                    <ShareFileButton fileId={file.id} fileName={file.name}/>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditFile(file)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit File: {editingFile?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="viewUsers" className="text-right">
                                View Users
                              </Label>
                              <Input
                                id="viewUsers"
                                value={editingFile?.viewUsers||''}
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
                                value={editingFile?.downloadUsers ||''}
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
        </div>
      </CardContent>
    </Card>
  );
}
