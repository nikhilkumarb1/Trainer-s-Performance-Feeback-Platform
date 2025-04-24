import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertTrainerSchema } from "@shared/schema";
import { Loader2, UserPlus, BarChart3, Star } from "lucide-react";

// Extend trainer schema for form validation
const trainerFormSchema = insertTrainerSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type TrainerFormValues = z.infer<typeof trainerFormSchema>;

export default function TrainersPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch trainers and users data
  const { data: trainersData, isLoading } = useQuery({
    queryKey: ["/api/trainers"],
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
  });

  // Form for adding new trainer
  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      userId: 0,
      department: "",
      specialty: "",
      username: "",
      fullName: "",
      password: "",
    },
  });

  // Mutation for creating a user
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
  });

  // Mutation for creating a trainer
  const createTrainerMutation = useMutation({
    mutationFn: async (trainerData: any) => {
      const res = await apiRequest("POST", "/api/trainers", trainerData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Trainer created",
        description: "The trainer has been successfully added",
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/trainers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create trainer",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  async function onSubmit(values: TrainerFormValues) {
    try {
      // First create the user
      const userData = {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        role: "trainer",
      };

      const user = await createUserMutation.mutateAsync(userData);

      // Then create the trainer profile
      const trainerData = {
        userId: user.id,
        department: values.department,
        specialty: values.specialty,
      };

      await createTrainerMutation.mutateAsync(trainerData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the trainer",
        variant: "destructive",
      });
    }
  }

  const isSubmitting = createUserMutation.isPending || createTrainerMutation.isPending;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 fixed inset-y-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header title="Trainer Management" />
        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Trainers</h1>
              <p className="text-slate-500">Manage and monitor your training team</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Trainer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Trainer</DialogTitle>
                  <DialogDescription>
                    Create a new trainer account and profile
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
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
                                <SelectValue placeholder="Select a department" />
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
                      control={form.control}
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
                                <SelectValue placeholder="Select a specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Technical Training">
                                Technical Training
                              </SelectItem>
                              <SelectItem value="Leadership Training">
                                Leadership Training
                              </SelectItem>
                              <SelectItem value="Soft Skills Training">
                                Soft Skills Training
                              </SelectItem>
                              <SelectItem value="Product Training">
                                Product Training
                              </SelectItem>
                              <SelectItem value="Sales Training">
                                Sales Training
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                          </>
                        ) : (
                          "Add Trainer"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trainersData && trainersData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainersData.map((trainer: any) => (
                      <TableRow key={trainer.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                              {trainer.fullName
                                ? trainer.fullName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "T"}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-slate-700">
                                {trainer.fullName || "Unnamed Trainer"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {trainer.username || ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{trainer.department || "Not assigned"}</TableCell>
                        <TableCell>{trainer.specialty || "Not specified"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-slate-700">4.7</span>
                            <div className="ml-2 flex text-amber-400">
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>183</TableCell>
                        <TableCell>
                          <Button variant="ghost" className="h-8 w-8 p-0" asChild>
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500">No trainers found</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Add your first trainer to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
