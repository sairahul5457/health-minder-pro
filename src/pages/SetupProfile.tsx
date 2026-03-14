import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/context/ProfileContext";
import { User, Phone, Mail, Heart, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SetupProfile = () => {
  const { saveProfile } = useProfile();
  const [form, setForm] = useState({
    name: "",
    age: "",
    caregiverPhone: "",
    caregiverEmail: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.age.trim()) {
      toast({ title: "⚠️ Required", description: "Please enter your name and age." });
      return;
    }
    setSaving(true);
    await saveProfile({
      name: form.name.trim(),
      age: parseInt(form.age),
      caregiverPhone: form.caregiverPhone.trim(),
      caregiverEmail: form.caregiverEmail.trim(),
      notifications: true,
      caregiverAlerts: true,
    });
    toast({ title: "✅ Welcome!", description: "Your profile has been created." });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">MedRemind</h1>
          <p className="text-muted-foreground">Your smart medication companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Your Details
            </h3>
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                required
                min="1"
                max="150"
                placeholder="Enter your age"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
          </div>

          {/* Caregiver */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Caregiver Contact
            </h3>
            <p className="text-sm text-muted-foreground">Will be notified if you miss a reminder</p>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={form.caregiverPhone}
                onChange={(e) => setForm((f) => ({ ...f, caregiverPhone: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="caregiver@email.com"
                value={form.caregiverEmail}
                onChange={(e) => setForm((f) => ({ ...f, caregiverEmail: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-12 text-base gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl"
          >
            {saving ? "Setting up..." : "Get Started 🚀"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
