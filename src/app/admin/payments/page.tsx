"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

type Payment = {
  id: string;
  user: string;
  plan: "pro" | "business";
  amount: number;
  status: "paid" | "failed" | "refunded" | "pending";
  created_at: string;
};

const mock: Payment[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `pay_${3000 + i}`,
  user: `user_${1000 + (i % 5)}`,
  plan: (["pro", "business"] as const)[i % 2],
  amount: (i % 2 === 0 ? 19 : 49),
  status: (["paid", "pending", "failed"] as const)[i % 3],
  created_at: new Date(Date.now() - i * 43200000).toISOString(),
}));

export default function PaymentsPage() {
  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>Payments</motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Transactions via mock data. Connect to SSLCommerz later.
        </motion.p>

        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border bg-white shadow-soft-1">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {mock.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3">{p.user}</td>
                    <td className="px-4 py-3 capitalize">{p.plan}</td>
                    <td className="px-4 py-3">${p.amount}</td>
                    <td className="px-4 py-3">
                      <span className={
                        p.status === "paid" ? "text-green-600" :
                        p.status === "pending" ? "text-amber-600" :
                        p.status === "refunded" ? "text-blue-600" : "text-red-600"
                      }>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
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