import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";

// Profile update form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(1, "Department is required"),
  specialty: z.string().min(1, "Specialty is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch trainer data
  const { data: trainerData, isLoading } = useQuery({
    queryKey: ["/api/trainers/by-user", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/trainers/by-user/${user?.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch trainer profile");
      }
      return res.json();
    },
    enabled: !!user,
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      department: trainerData?.department || "",
      specialty: trainerData?.specialty || "",
      email: "trainer@example.com", // Placeholder
      phone: "(555) 123-4567", // Placeholder
      location: "New York, NY", // Placeholder
      bio: "Experienced trainer specializing in technical training and professional development.", // Placeholder
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      // Update user
      await apiRequest("PATCH", `/api/users/${user?.id}`, {
        fullName: values.fullName,
      });
      
      // Update trainer profile
      if (trainerData) {
        await apiRequest("PATCH", `/api/trainers/${trainerData.id}`, {
          department: values.department,
          specialty: values.specialty,
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainers/by-user", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      await apiRequest("POST", "/api/change-password", {
        userId: user?.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to change password",
        description: error.message || "Please check your current password and try again",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  function onProfileSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values);
  }

  // Handle password form submission
  function onPasswordSubmit(values: PasswordFormValues) {
    changePasswordMutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <div className="hidden lg:block lg:w-64 fixed inset-y-0">
          <Sidebar />
        </div>
        <div className="flex-1 lg:ml-64">
          <Header title="Profile" />
          <main className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title="Profile" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Trainer Profile</h1>
            <p className="text-slate-500">Manage your personal information and account settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "T"}
                </div>
                <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                <p className="text-sm text-slate-500 mb-4">{trainerData?.specialty || "Trainer"}</p>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    <span>@{user?.username}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    <span>trainer@example.com</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    <span>New York, NY</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{trainerData?.department || "Department"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="grid grid-cols-2 w-full gap-2 text-center">
                  <div className="p-2 rounded-md bg-slate-100">
                    <p className="text-xs text-slate-500">Sessions</p>
                    <p className="font-semibold">24</p>
                  </div>
                  <div className="p-2 rounded-md bg-slate-100">
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="font-semibold">4.7</p>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Profile Settings */}
            <div className="md:col-span-2">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your profile information and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Engineering">Engineering</SelectItem>
                                      <SelectItem value="HR">Human Resources</SelectItem>
                                      <SelectItem value="Management">Management</SelectItem>
                                      <SelectItem value="Sales">Sales</SelectItem>
                                      <SelectItem value="Marketing">Marketing</SelectItem>
                                      <SelectItem value="IT">IT</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="specialty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specialty</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select specialty" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Technical Training">Technical Training</SelectItem>
                                      <SelectItem value="Leadership Training">Leadership Training</SelectItem>
                                      <SelectItem value="Soft Skills Training">Soft Skills Training</SelectItem>
                                      <SelectItem value="Product Training">Product Training</SelectItem>
                                      <SelectItem value="Sales Training">Sales Training</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(555) 123-4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York, NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Tell us about yourself"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Brief description about your experience and expertise.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 6 characters.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={changePasswordMutation.isPending}
                            >
                              {changePasswordMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
