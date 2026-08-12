import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface LoginRecord {
  _id: string;
  loginAt: string;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  city: string;
  state: string;
  country: string;
  isNewDevice: boolean;
  trusted: boolean;
}

export default function SecurityPage() {
  const { user, theme, setTheme } = useUser();
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?._id) { setLoading(false); return; }
    axiosInstance.get(`/user/${user._id}/security`)
      .then((response) => setRecords(response.data.loginHistory || []))
      .catch(() => setMessage("Unable to load security history."))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (!user) return <main className="min-w-0 flex-1 p-4 sm:p-6">Sign in to view account security.</main>;

  return (
    <main className="min-w-0 flex-1 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Account security</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review recent logins and control your appearance preference.</p>
        </div>

        {message && <p className="rounded-md bg-muted p-3 text-sm">{message}</p>}

        <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="font-semibold">Theme preference</h2>
          <p className="mt-1 text-sm text-muted-foreground">System uses light theme from 5:00 AM–12:00 PM IST and dark theme at other times.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["system", "light", "dark"] as const).map((option) => (
              <Button key={option} variant={theme === option ? "default" : "outline"} onClick={() => setTheme(option)} className="capitalize">{option}</Button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-green-600" />
            <div><h2 className="font-semibold">Login activity</h2><p className="mt-1 text-sm text-muted-foreground">We record browser, operating system, device type, IP address, and login time. Location is unavailable unless a trusted location provider is added.</p></div>
          </div>
          {loading ? <p className="mt-6 text-sm">Loading activity...</p> : records.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">No login activity recorded yet.</p> : <div className="mt-5 space-y-3">{records.map((record) => <div key={record._id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="rounded-full bg-muted p-2">{record.isNewDevice ? <ShieldAlert className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}</div><div><p className="font-medium">{record.browser} · {record.operatingSystem}</p><p className="text-sm text-muted-foreground">{record.deviceType} · {record.ipAddress}</p><p className="text-xs text-muted-foreground">{new Date(record.loginAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div></div><span className={`self-start rounded-full px-2 py-1 text-xs ${record.isNewDevice ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{record.isNewDevice ? "New device noticed" : "Recognized device"}</span></div>)}</div>}
        </section>
      </div>
    </main>
  );
}
