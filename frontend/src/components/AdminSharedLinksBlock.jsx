import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function AdminSharedLinksBlock({ searchQuery }) {
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sortField, setSortField] = useState('fileName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Fetch shared links from API
    // For now, we'll use dummy data
    setSharedLinks([
      { id: '1', fileId: '1', fileName: 'document.pdf', sharedBy: 'John Doe', sharedAt: '2023-04-01', downloadCount: 5, maxDownloads: 10, shareUrl: 'https://example.com/share/1' },
      { id: '2', fileId: '2', fileName: 'image.jpg', sharedBy: 'Jane Smith', sharedAt: '2023-04-15', downloadCount: 3, maxDownloads: 5, shareUrl: 'https://example.com/share/2' },
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

  const handleDeleteLink = (linkId) => {
    // Implement link deletion logic here
    console.log('Deleting shared link:', linkId);
    setSharedLinks(sharedLinks.filter(link => link.id !== linkId));
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
                      {link.shareUrl}
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
