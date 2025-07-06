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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit, Plus, Trash2, Upload } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  description?: string;
  category_id?: string;
  image_url?: string | null;
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface BookManagementProps {
  books: Book[];
  categories: Category[];
  onRefresh: () => void;
}

const BookManagement = ({ books, categories, onRefresh }: BookManagementProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    stock_quantity: "",
    description: "",
    category_id: "",
    image_url: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      price: "",
      stock_quantity: "",
      description: "",
      category_id: "",
      image_url: "",
    });
    setSelectedFile(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `book-covers/${fileName}`;

    const { error } = await supabase.storage
      .from('book-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }

    const { data } = supabase.storage
      .from('book-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreate = async () => {
    setUploading(true);
    
    let imageUrl = formData.image_url;
    
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) {
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from('books').insert([{
      title: formData.title,
      author: formData.author,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      description: formData.description || null,
      category_id: formData.category_id || null,
      image_url: imageUrl || null,
    }]);

    if (error) {
      toast.error('Failed to create book');
    } else {
      toast.success('Book created successfully');
      setIsCreateOpen(false);
      resetForm();
      onRefresh();
    }
    setUploading(false);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      stock_quantity: book.stock_quantity.toString(),
      description: book.description || "",
      category_id: book.category_id || "",
      image_url: book.image_url || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingBook) return;

    setUploading(true);
    
    let imageUrl = formData.image_url;
    
    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) {
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase
      .from('books')
      .update({
        title: formData.title,
        author: formData.author,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        description: formData.description || null,
        category_id: formData.category_id || null,
        image_url: imageUrl || null,
      })
      .eq('id', editingBook.id);

    if (error) {
      toast.error('Failed to update book');
    } else {
      toast.success('Book updated successfully');
      setIsEditOpen(false);
      setEditingBook(null);
      resetForm();
      onRefresh();
    }
    setUploading(false);
  };

  const handleDelete = async (bookId: string) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (error) {
      toast.error('Failed to delete book');
    } else {
      toast.success('Book deleted successfully');
      onRefresh();
    }
  };

  const BookForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-title" : "title"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Title
        </Label>
        <Input
          id={isEdit ? "edit-title" : "title"}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
        />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-author" : "author"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Author
        </Label>
        <Input
          id={isEdit ? "edit-author" : "author"}
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
        />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-price" : "price"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Price
        </Label>
        <Input
          id={isEdit ? "edit-price" : "price"}
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
        />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-stock" : "stock"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Stock Quantity
        </Label>
        <Input
          id={isEdit ? "edit-stock" : "stock"}
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
        />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-category" : "category"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Category
        </Label>
        <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
          <SelectTrigger className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-sans border-gray-200 dark:border-gray-600 rounded-md">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="text-[0.65rem] sm:text-xs">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-image" : "image"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Book Cover Image
        </Label>
        <Input
          id={isEdit ? "edit-image" : "image"}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 h-8"
        />
        {formData.image_url && (
          <div className="mt-2">
            <img
              src={formData.image_url}
              alt="Current cover"
              className="w-16 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600"
            />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={isEdit ? "edit-description" : "description"} className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">
          Description
        </Label>
        <Textarea
          id={isEdit ? "edit-description" : "description"}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="text-[0.65rem] sm:text-xs text-gray-900 dark:text-white font-sans bg-gray-50 dark:bg-gray-700 rounded-md border-gray-200 dark:border-gray-600 min-h-[80px]"
        />
      </div>
      <Button 
        onClick={isEdit ? handleUpdate : handleCreate} 
        className="w-full text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
        disabled={uploading}
        size="sm"
      >
        {uploading ? (
          <>
            <Upload className="h-3 w-3 mr-1 animate-spin" />
            {isEdit ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          isEdit ? 'Update Book' : 'Create Book'
        )}
      </Button>
    </div>
  );

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl border-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
          Books Management
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="text-[0.65rem] sm:text-xs bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[18rem] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-3">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white font-sans">
                Create Book
              </DialogTitle>
            </DialogHeader>
            <BookForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Image
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Title
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Author
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Category
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Price
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Stock
              </TableHead>
              <TableHead className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id} className="border-b border-gray-200 dark:border-gray-700">
                <TableCell>
                  {book.image_url ? (
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs font-semibold text-gray-900 dark:text-white font-sans">
                  {book.title}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  {book.author}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  {book.categories?.name || 'N/A'}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
                  ${book.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  {book.stock_quantity}
                </TableCell>
                <TableCell className="space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(book)}
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
                          This will permanently delete "{book.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          className="text-[0.65rem] sm:text-xs border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans font-semibold rounded-md transition-all duration-200 hover:scale-[1.02] shadow-md h-8"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(book.id)}
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
          <DialogContent className="max-w-[18rem] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl font-sans p-3.5">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-3">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white font-sans">
                Edit Book
              </DialogTitle>
            </DialogHeader>
            <BookForm isEdit={true} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BookManagement;