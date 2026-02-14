import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { User, Phone, Mail, Save, Bell, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    age: "65",
    caregiverPhone: "+1 555-0123",
    caregiverEmail: "caregiver@email.com",
  });
  const [notifications, setNotifications] = useState(true);
  const [caregiverAlerts, setCaregiverAlerts] = useState(true);

  const handleSave = () => {
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
              <h3 className="font-semibold text-foreground text-lg">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">Age: {profile.age}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={profile.age} onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))} className="rounded-xl mt-1" />
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
            <Input id="phone" value={profile.caregiverPhone} onChange={(e) => setProfile((p) => ({ ...p, caregiverPhone: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</Label>
            <Input id="email" type="email" value={profile.caregiverEmail} onChange={(e) => setProfile((p) => ({ ...p, caregiverEmail: e.target.value }))} className="rounded-xl mt-1" />
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
