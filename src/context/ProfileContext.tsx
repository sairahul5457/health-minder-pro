import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db, DBProfile } from "@/lib/db";

interface ProfileContextType {
  profile: DBProfile | null;
  loading: boolean;
  saveProfile: (data: Omit<DBProfile, "id" | "createdAt">) => Promise<void>;
  updateProfile: (data: Partial<DBProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.profiles.toCollection().first().then((p) => {
      setProfile(p || null);
      setLoading(false);
    });
  }, []);

  const saveProfile = async (data: Omit<DBProfile, "id" | "createdAt">) => {
    const id = await db.profiles.add({ ...data, createdAt: new Date() });
    const saved = await db.profiles.get(id);
    if (saved) setProfile(saved);
  };

  const updateProfile = async (data: Partial<DBProfile>) => {
    if (!profile?.id) return;
    await db.profiles.update(profile.id, data);
    const updated = await db.profiles.get(profile.id);
    if (updated) setProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, saveProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};
