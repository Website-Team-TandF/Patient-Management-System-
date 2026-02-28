import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { createUser } from '../../../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  userRoles: z.array(z.enum(["admin", "doctor", "receptionist"])).min(1, "Select at least one role"),
  departments: z.string().optional(),
  specializations: z.string().optional(),
  consultationFee: z.string().optional(), // Using string for input, will convert to number
  extraLine: z.string().optional(),
}).refine((data) => {
  if (data.userRoles.includes("doctor")) {
    return !!data.departments && !!data.specializations && !!data.consultationFee;
  }
  return true;
}, {
  message: "Department, Specialization, and Fee are required for Doctors",
  path: ["departments"], // Highlight department field on error
});

type FormValues = z.infer<typeof formSchema>;

const AddUserForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      userRoles: ["doctor"],
      departments: "",
      specializations: "",
      consultationFee: "",
      extraLine: "",
    },
  });

  const userRoles = form.watch("userRoles");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const userData = {
        ...values,
        userRoles: values.userRoles,
        departments: values.departments ? [values.departments] : [],
        specializations: values.specializations ? [values.specializations] : [],
        consultationFee: values.consultationFee ? parseFloat(values.consultationFee) : undefined,
      };
      
      await createUser(userData);
      toast.success("User created successfully");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" {...field} />
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
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormDescription>
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userRoles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={(val) => field.onChange([val])} 
                defaultValue={field.value?.[0]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>

                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {userRoles.includes("doctor") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
            <h3 className="md:col-span-2 font-medium mb-2">Doctor Details</h3>
            
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="Interventional Cardiologist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consultationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation Fee (₹)</FormLabel>
                  <FormControl>
                    <Input placeholder="1000" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extraLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extra Info (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="15 years of experience" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </form>
    </Form>
  );
};

export default AddUserForm;
