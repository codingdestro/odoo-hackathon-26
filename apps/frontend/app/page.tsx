"use client";

import { useEffect, useState } from "react";
import { CreateItemSchema, type Item, type CreateItem } from "@odoo-hackathon-26/shared";

const API_URL = "http://localhost:3001/api";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/items`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = CreateItemSchema.safeParse({ name, description: desc || undefined });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    setName("");
    setDesc("");
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Items</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <strong>{item.name}</strong>
            {item.description && <> — {item.description}</>}
            <button
              onClick={() => handleDelete(item.id)}
              style={{ marginLeft: 12, color: "red" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
