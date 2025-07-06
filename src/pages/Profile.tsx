import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Package, Settings, LogOut, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    price: number;
    books: {
      title: string;
      author: string;
    };
  }>;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          quantity,
          price,
          books (
            title,
            author
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } else {
      setOrders(data || []);
    }
  };

  const updateProfile = async (formData: FormData) => {
    if (!user || !profile) return;

    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.get("full_name") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      fetchProfile();
    }
    setUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-sans";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-sans";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-sans";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-sans";
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-sans mb-4">
            Profile not found
          </h1>
          <Button
            variant="outline"
            className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
            My Account
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-sans">
            Manage your profile and orders
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
            Welcome, {profile.full_name || "User"}
          </h2>
          <Button
            variant="outline"
            className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
            <TabsTrigger
              value="profile"
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              <User className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              <Package className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Recent Orders
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="px-6 py-3 text-base sm:text-lg font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-md font-sans"
            >
              <Settings className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateProfile(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="role"
                        className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans"
                      >
                        Role
                      </Label>
                      <Input
                        id="role"
                        value={profile.role}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="full_name"
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile.full_name || ""}
                      placeholder="Enter your full name"
                      className="text-sm sm:text-base text-gray-900 dark:text-white font-sans"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profile.phone || ""}
                      placeholder="Enter your phone number"
                      className="text-sm sm:text-base text-gray-900 dark:text-white font-sans"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="address"
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans"
                    >
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={profile.address || ""}
                      placeholder="Enter your address"
                      className="text-sm sm:text-base text-gray-900 dark:text-white font-sans"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updating}
                    className="text-sm font-sans bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                  Recent Orders
                </h2>
                <Link to="/orders">
                  <Button
                    variant="outline"
                    className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                  >
                    View All Orders
                    <ArrowRight className="h-5 w-5 ml-2 text-indigo-500 dark:text-indigo-400" />
                  </Button>
                </Link>
              </div>
              {orders.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <Package className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans mb-2">
                      No orders yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                      Your order history will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                       的工作

                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusBadgeClassName(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-sans mt-1">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div
                            key={item.books.title}
                            className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans"
                          >
                            <span>
                              {item.books.title} by {item.books.author}
                            </span>
                            <span>
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Receive updates about your orders
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-sans">
                      Privacy Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Control your data and privacy preferences
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 font-sans"
                  >
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 font-sans">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-sm font-sans bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;