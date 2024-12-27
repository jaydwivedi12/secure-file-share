import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download } from "lucide-react";
import { ViewFileButton } from "./ViewFileButton";
import { DownloadFileButton } from "./DownloadFileButton";
import { useEffect, useState } from "react";
import api from "@/services/apiConfig";
import formatFileSize from "@/utils/formatFileSize";

export function SharedWithYouBlock() {
  const [files, setFiles] = useState([]);

  // Fetch files shared with the user
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get(`/file/get-shared-files/`);
        console.log("Fetched files:", response.data); // Debug log

      
        setFiles(
          response.data.files.map((file) => ({
            id: file.id,
            name: file.name,
            size: formatFileSize(file.size), // Format the file size
            type: file.type,
            permission: file.permission,
          }))
        );
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-serif bg-purple-100 p-4 rounded-lg">
            Files Shared With You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>{file.type}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <ViewFileButton fileId={file.id} fileType={file.type} fileName={file.name}  />
                      {file.permission === "download" && (
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
  );
}
