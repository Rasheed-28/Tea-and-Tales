import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Package, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import BookManagement from "@/components/admin/BookManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database['public']['Enums']['order_status'];

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  description?: string;
  category_id?: string;
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_email?: string;
  customer_name?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      setLoading(false);
    } else {
      setUserRole(data.role);
      if (data.role === 'admin') {
        fetchAllData();
      }
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchBooks(),
      fetchCategories(),
      fetchOrders()
    ]);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_blocked, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        price,
        stock_quantity,
        description,
        category_id,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      setOrders([]);
      return;
    }

    if (!ordersData || ordersData.length === 0) {
      setOrders([]);
      return;
    }

    const userIds = ordersData.map(order => order.user_id);

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    const ordersWithCustomerInfo = ordersData.map(order => {
      const profile = profilesMap.get(order.user_id);
      return {
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        customer_email: profile?.email || 'N/A',
        customer_name: profile?.full_name || 'N/A'
      };
    });

    setOrders(ordersWithCustomerInfo);
  };

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !isBlocked })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    } else {
      toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
        <div className="text-2xl font-medium text-gray-600 dark:text-gray-300 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with sans-serif font and adjusted sizes */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-sans">
            Manage your bookstore with ease
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          {/* TabsList with sans-serif font and larger font sizes */}
          <TabsList className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
            <TabsTrigger 
              value="overview" 
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="books" 
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              Books
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Cards with sans-serif font and adjusted font sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans">
                    Total Books
                  </CardTitle>
                  <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">{books.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans">
                    Total Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">{users.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans">
                    Total Orders
                  </CardTitle>
                  <Package className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">{orders.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 font-sans">
                    Categories
                  </CardTitle>
                  <Plus className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans">{categories.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books">
            <BookManagement 
              books={books} 
              categories={categories} 
              onRefresh={fetchBooks} 
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement 
              categories={categories} 
              onRefresh={fetchCategories} 
            />
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                  Orders Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Order ID</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Customer Email</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Customer Name</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Amount</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Status</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Date</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="text-sm sm:text-base font-medium text-gray-900 dark:text-white font-sans">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">{order.customer_email}</TableCell>
                        <TableCell className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">{order.customer_name}</TableCell>
                        <TableCell className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">${order.total_amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === 'pending' ? 'secondary' : 
                              order.status === 'confirmed' ? 'outline' : 
                              'default'
                            }
                            className={`
                              text-sm font-sans
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                            `}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {order.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                  Users Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Email</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Name</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Role</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Status</TableHead>
                      <TableHead className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userData) => (
                      <TableRow key={userData.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="text-sm sm:text-base font-medium text-gray-900 dark:text-white font-sans">
                          {userData.email}
                        </TableCell>
                        <TableCell className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans">
                          {userData.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={userData.role === 'admin' ? 'default' : 'secondary'}
                            className={`
                              text-sm font-sans
                              ${userData.role === 'admin' ? 
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}
                            `}
                          >
                            {userData.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={userData.is_blocked ? 'destructive' : 'default'}
                            className={`
                              text-sm font-sans
                              ${userData.is_blocked ? 
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                            `}
                          >
                            {userData.is_blocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userData.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                              onClick={() => toggleUserBlock(userData.id, userData.is_blocked)}
                            >
                              {userData.is_blocked ? 'Unblock' : 'Block'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;