"use client";

import { useState, useEffect } from "react";

interface User {
  email: string;
  role: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();

    // Listener para cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        checkUser();
      }
    };

    // Listener para eventos personalizados
    const handleUserLogin = () => {
      setTimeout(checkUser, 100);
    };

    const handleUserLogout = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new CustomEvent("userLogin"));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new CustomEvent("userLogout"));
  };

  return { user, loading, login, logout };
};

