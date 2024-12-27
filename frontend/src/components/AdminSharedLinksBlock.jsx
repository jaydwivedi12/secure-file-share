import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link,Trash2 } from 'lucide-react';
import api from '@/services/apiConfig';
import { toast } from 'react-toastify';

export function AdminSharedLinksBlock({ searchQuery }) {
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sortField, setSortField] = useState('fileName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Fetch shared links from API
    const fetchSharedLinks = async () => {
      try {
        const response = await api.get('/file/get-all-share-links/'); 
        console.log(response);
        
        // Map API response to the expected data format
        const formattedLinks = response.data.share_links.map((link) => ({
          id: link.link_id,
          fileId: link.file_id,
          fileName: link.file_name,
          sharedBy: link.shared_by,
          sharedAt: link.created_at,
          downloadCount: link.download_count,
          maxDownloads: link.max_downloads,
          shareUrl: `/share/${link.link_id}`,
        }));
        
        setSharedLinks(formattedLinks);
      } catch (error) {
        console.error('Error fetching shared links:', error);
      }
    };

    fetchSharedLinks();
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLinks = [...sharedLinks].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredLinks = sortedLinks.filter(
    (link) =>
      link.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.sharedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteLink = async (linkId) => {
    // Implement link deletion logic here
    const response = await api.delete(`/file/delete_shareable_link/${linkId}/`);
    if (response.status === 200) {
      setSharedLinks(sharedLinks.filter(link => link.id !== linkId));
      toast.success("Link deleted successfully!")
    } else {
      console.error('Error deleting shared link:', linkId);
      toast.error("Error deleting link.")
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[50vh] overflow-auto bg-white p-4 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('fileName')} className="cursor-pointer">File Name</TableHead>
                <TableHead onClick={() => handleSort('sharedBy')} className="cursor-pointer">Shared By</TableHead>
                <TableHead onClick={() => handleSort('sharedAt')} className="cursor-pointer">Shared At</TableHead>
                <TableHead onClick={() => handleSort('downloadCount')} className="cursor-pointer">Download Count</TableHead>
                <TableHead onClick={() => handleSort('maxDownloads')} className="cursor-pointer">Max Downloads</TableHead>
                <TableHead>Share URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredLinks.map((link) => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell>{link.fileName}</TableCell>
                    <TableCell>{link.sharedBy}</TableCell>
                    <TableCell>{link.sharedAt}</TableCell>
                    <TableCell>{link.downloadCount}</TableCell>
                    <TableCell>{link.maxDownloads}</TableCell>
                    <TableCell>
                      <a href={link.shareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        
                      <Link className="h-4 w-4 mr-1" />
                      View Link
                    </a>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteLink(link.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
