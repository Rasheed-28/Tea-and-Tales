import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onRefresh: () => void;
}

const CategoryManagement = ({ categories, onRefresh }: CategoryManagementProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleCreate = async () => {
    const { error } = await supabase.from('categories').insert([{
      name: formData.name,
      description: formData.description || null,
    }]);

    if (error) {
      toast.error('Failed to create category');
    } else {
      toast.success('Category created successfully');
      setIsCreateOpen(false);
      resetForm();
      onRefresh();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    const { error } = await supabase
      .from('categories')
      .update({
        name: formData.name,
        description: formData.description || null,
      })
      .eq('id', editingCategory.id);

    if (error) {
      toast.error('Failed to update category');
    } else {
      toast.success('Category updated successfully');
      setIsEditOpen(false);
      setEditingCategory(null);
      resetForm();
      onRefresh();
    }
  };

  const handleDelete = async (categoryId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast.error('Failed to delete category');
    } else {
      toast.success('Category deleted successfully');
      onRefresh();
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl border-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
          Categories Management
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="text-xs sm:text-sm bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[18rem] bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-3">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white font-sans">
                Create Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label htmlFor="name" className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
                />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="description" className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 min-h-[80px]"
                />
              </div>
              <Button 
                onClick={handleCreate}
                className="w-full text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                size="sm"
              >
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Name
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Description
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Created
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="border-b border-gray-200 dark:border-gray-700">
                <TableCell className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                  {category.name}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  {category.description || 'N/A'}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(category)}
                    className="text-[0.65rem] sm:text-xs border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[0.65rem] sm:text-xs border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[18rem] bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-gray-900 dark:text-white font-sans">
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                          This will permanently delete "{category.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          className="text-[0.65rem] sm:text-xs border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(category.id)}
                          className="text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-[18rem] bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-3">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white font-sans">
                Edit Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label htmlFor="edit-name" className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
                />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="edit-description" className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 min-h-[80px]"
                />
              </div>
              <Button 
                onClick={handleUpdate}
                className="w-full text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                size="sm"
              >
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CategoryManagement;