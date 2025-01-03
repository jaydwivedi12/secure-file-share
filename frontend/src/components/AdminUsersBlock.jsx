import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/services/apiConfig";
import { toast } from "react-toastify";

export function AdminUsersBlock({ searchQuery }) {
  const [users, setUsers] = useState([]);
  const [sortField, setSortField] = useState("email");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/get-all-users/");
      const mappedUsers = response.data.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || "N/A",
        createdAt: new Date(user.date_joined).toLocaleDateString(),
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (email) => {
    try {
        const response = await api.delete(`/auth/delete-user/${email}/`);
        if(response.status === 200) {
            toast.success("User deleted successfully!");
            setUsers(users.filter((user) => user.email !== email));
        } else {
            toast.error("Error deleting user.");
        }
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl font-serif bg-yellow-100 p-4 rounded-lg">Users</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="h-[50vh] overflow-auto bg-white p-4 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("email")} className="cursor-pointer">Email</TableHead>
              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.email}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.email)}>
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
