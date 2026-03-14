import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { User, Phone, Mail, Save, Bell, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/context/ProfileContext";

const Profile = () => {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    name: "",
    age: "",
    caregiverPhone: "",
    caregiverEmail: "",
  });
  const [notifications, setNotifications] = useState(true);
  const [caregiverAlerts, setCaregiverAlerts] = useState(true);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        age: String(profile.age),
        caregiverPhone: profile.caregiverPhone || "",
        caregiverEmail: profile.caregiverEmail || "",
      });
      setNotifications(profile.notifications);
      setCaregiverAlerts(profile.caregiverAlerts);
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      name: form.name.trim(),
      age: parseInt(form.age),
      caregiverPhone: form.caregiverPhone.trim(),
      caregiverEmail: form.caregiverEmail.trim(),
      notifications,
      caregiverAlerts,
    });
    toast({
      title: "✅ Profile Updated",
      description: "Your profile and preferences have been saved.",
    });
  };

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Profile 👤</h2>
        <p className="text-muted-foreground mt-1">Manage your health profile & preferences</p>
      </div>

      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{form.name}</h3>
              <p className="text-sm text-muted-foreground">Age: {form.age}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} className="rounded-xl mt-1" />
          </div>
        </div>

        {/* Caregiver */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Caregiver Contact
          </h3>
          <p className="text-sm text-muted-foreground">Will be notified if you miss a reminder</p>
          <div>
            <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</Label>
            <Input id="phone" value={form.caregiverPhone} onChange={(e) => setForm((p) => ({ ...p, caregiverPhone: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</Label>
            <Input id="email" type="email" value={form.caregiverEmail} onChange={(e) => setForm((p) => ({ ...p, caregiverEmail: e.target.value }))} className="rounded-xl mt-1" />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notification Preferences
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Browser Notifications</p>
              <p className="text-xs text-muted-foreground">Get alerts in your browser</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Caregiver Alerts</p>
              <p className="text-xs text-muted-foreground">Notify caregiver on missed doses</p>
            </div>
            <Switch checked={caregiverAlerts} onCheckedChange={setCaregiverAlerts} />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full h-12 text-base gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl">
          <Save className="w-5 h-5 mr-2" /> Save Profile
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
