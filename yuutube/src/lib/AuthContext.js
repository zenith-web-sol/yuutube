import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext({
  /** @type {any} */ user: null,
  login: (_userdata) => {},
  logout: async () => {},
  handlegooglesignin: async () => {},
  theme: "system",
  setTheme: async (_theme) => {},
});

const istDefaultTheme = () => {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour >= 5 && hour < 12 ? "light" : "dark";
};

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  const resolved = theme === "system" ? istDefaultTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setThemeState] = useState("system");

  const login = (userdata) => {
    const savedTheme = userdata?.themePreference || localStorage.getItem("yuutube-theme") || "system";
    setUser(userdata);
    setThemeState(savedTheme);
    localStorage.setItem("user", JSON.stringify(userdata));
    localStorage.setItem("yuutube-theme", savedTheme);
    applyTheme(savedTheme);
  };

  const setTheme = async (nextTheme) => {
    setThemeState(nextTheme);
    localStorage.setItem("yuutube-theme", nextTheme);
    applyTheme(nextTheme);
    if (user?._id) {
      try {
        const response = await axiosInstance.patch(`/user/update/${user._id}`, { themePreference: nextTheme });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Unable to save theme preference:", error);
      }
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    setThemeState("system");
    localStorage.removeItem("yuutube-theme");
    applyTheme("system");
    try { await signOut(auth); } catch (error) { console.error("Error during sign out:", error); }
  };

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const response = await axiosInstance.post("/user/login", { email: firebaseuser.email, name: firebaseuser.displayName, image: firebaseuser.photoURL || "https://github.com/shadcn.png" });
      login(response.data.result);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("yuutube-theme") || "system";
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (!firebaseuser) return;
      try {
        const response = await axiosInstance.post("/user/login", { email: firebaseuser.email, name: firebaseuser.displayName, image: firebaseuser.photoURL || "https://github.com/shadcn.png" });
        login(response.data.result);
      } catch (error) { console.error(error); }
    });
    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, login, logout, handlegooglesignin, theme, setTheme }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
