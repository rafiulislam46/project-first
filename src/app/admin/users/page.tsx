"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  email: string;
  plan: "free" | "pro" | "business";
  created_at: string;
};

const mockUsers: UserRow[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `user_${1000 + i}`,
  email: `user${i + 1}@example.com`,
  plan: (["free", "pro", "business"] as const)[i % 3],
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>(mockUsers);

  const onChangePlan = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, plan: r.plan === "free" ? "pro" : r.plan === "pro" ? "business" : "free" }
          : r
      )
    );
  };

  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>Users</motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Manage users and plans. Actions are stubbed for now.
        </motion.p>

        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border bg-white shadow-soft-1">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3 capitalize">{r.plan}</td>
                    <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button onClick={() => onChangePlan(r.id)} size="sm" variant="outline">
                        Upgrade/Downgrade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}