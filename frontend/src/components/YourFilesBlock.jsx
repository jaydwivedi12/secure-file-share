import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash } from 'lucide-react';
import { ViewFileButton } from './ViewFileButton';
import { DownloadFileButton } from './DownloadFileButton';
import { ShareFileButton } from './ShareFileButton';

import api from '../services/apiConfig';
import formatFileSize from '../utils/formatFileSize';
import { toast } from 'react-toastify';

export function YourFilesBlock() {
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

  // Fetch files from the API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/file/get-all-files/');
        if (response.data.success) {
          const formattedFiles = response.data.data.map((file) => ({
            id: file.file_id,
            name: file.filename,
            size: formatFileSize(parseInt(file.file_size)),
            type: file.content_type,
            uploadDate: new Date(file.uploaded_at).toLocaleString(),
            viewUsers:  [], 
            downloadUsers: [], 
          }));
          setFiles(formattedFiles);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    const response = await api.delete(`/file/delete-file/${id}/`);
    if (response.status === 200) {
      setFiles(files.filter(file => file.id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEdit = async (file) => {
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
      };
      
      try {
        const response = await api.put(`/file/update-permisssions/${editingFile.id}/`, {
          view_email: updatedFile.viewUsers,
          download_email: updatedFile.downloadUsers
        });

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-serif bg-yellow-100 p-4 rounded-lg">Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[50vh] overflow-auto bg-white p-4 rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="px-20" >Actions</TableHead>
                  <TableHead>Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <ViewFileButton fileId={file.id} fileType={file.type} fileName={file.name} />
                        <DownloadFileButton fileId={file.id} fileName={file.name} />
                        <ShareFileButton fileId={file.id} fileName={file.name}/>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(file)}>
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
                                  value={editingFile?.viewUsers || ''}
                                  onChange={(e) =>
                                    setEditingFile((prev) =>
                                      prev ? { ...prev, viewUsers: e.target.value } : null
                                    )
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="downloadUsers" className="text-right">
                                  Download Users
                                </Label>
                                <Input
                                  id="downloadUsers"
                                  value={editingFile?.downloadUsers || ''}
                                  onChange={(e) =>
                                    setEditingFile((prev) =>
                                      prev ? { ...prev, downloadUsers: e.target.value } : null
                                    )
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="bg-red-500 text-white" onClick={() => handleDelete(file.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{file.uploadDate}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}