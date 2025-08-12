import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  notifications: z.boolean(),
  emailAlerts: z.boolean(),
  autoApproval: z.boolean(),
  approvalLimit: z.string().min(1, "Approval limit is required"),
});

type SettingsData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      notifications: true,
      emailAlerts: true,
      autoApproval: false,
      approvalLimit: "5000",
    },
  });

  const onSubmit = (data: SettingsData) => {
    // In a real app, this would make an API call to update user settings
    console.log("Settings update:", data);
    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about requisition updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get email updates for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Approval Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-approve small requests</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve requests below your limit</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="approvalLimit">Approval Limit ($)</Label>
                      <Input
                        id="approvalLimit"
                        type="number"
                        defaultValue="5000"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline">Change Password</Button>
                  <Separator />
                  <Button variant="outline">Two-Factor Authentication</Button>
                </CardContent>
              </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}