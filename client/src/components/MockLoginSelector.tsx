import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockService } from "@/lib/mockService";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

export function MockLoginSelector() {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("teacher");
  const { loginMutation } = useAuth();

  const handleLogin = async () => {
    try {
      // Use the mock service directly to login with the selected role
      const { user, token } = await mockService.login(selectedRole, "password");
      
      // Update the query client with the user data
      queryClient.setQueryData(["/api/auth/user"], user);
      
      // Close the dialog
      setOpen(false);
    } catch (error) {
      console.error("Mock login failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
          Mock Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select User Role</DialogTitle>
          <DialogDescription>
            Choose a role to login as for testing purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher">Enseignant</SelectItem>
              <SelectItem value="department_head">Chef de département</SelectItem>
              <SelectItem value="resource_manager">Responsable des ressources</SelectItem>
              <SelectItem value="technician">Technicien</SelectItem>
              <SelectItem value="supplier">Fournisseur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleLogin}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
