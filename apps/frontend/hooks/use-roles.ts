"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Role {
  id: string;
  name: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/auth/roles")
      .then((res) => setRoles(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading, error };
}
