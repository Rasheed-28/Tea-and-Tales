import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Login = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast.error(error.message || 'Failed to sign in');
    } else {
      toast.success('Signed in successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.name);
    
    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created successfully! Please check your email to verify your account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <BookOpen className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-sans">
              Welcome to BookVault
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-2 font-sans">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <TabsTrigger 
                value="login" 
                className="text-sm sm:text-base font-sans data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-sm sm:text-base font-sans data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                    Login
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans" 
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-sans">
                    Sign Up
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-sans">
                    Create a new account to start shopping
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                        required
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                        minLength={6}
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm sm:text-base text-gray-900 dark:text-white font-sans">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                        className="text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-sans rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-sans" 
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;