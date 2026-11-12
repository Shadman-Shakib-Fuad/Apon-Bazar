"use client";

import { useState, useTransition, FormEvent } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/app/seller/actions";
import { categories } from "@/data/mock";
import { formatPrice } from "@/lib/utils";
import type { SellerProductView } from "@/types";

const empty = { name: "", category: "Vegetables", unit: "per kg", price: "", costPrice: "", stock: "" };

export default function SellerProductManager({ products }: { products: SellerProductView[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ price: "", costPrice: "", stock: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.ok) after?.();
      else setError(res.error ?? "Kichu ekta bhul hoyeche");
    });
  }

  function addProduct(e: FormEvent) {
    e.preventDefault();
    run(
      () =>
        createProduct({
          name: form.name,
          category: form.category,
          unit: form.unit,
          price: Number(form.price),
          costPrice: Number(form.costPrice),
          stock: Number(form.stock),
        }),
      () => {
        setForm(empty);
        setShowForm(false);
      }
    );
  }

  function startEdit(p: SellerProductView) {
    setEditId(p.id);
    setDraft({ price: String(p.price), costPrice: String(p.costPrice), stock: String(p.stock) });
  }

  const input = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary";
  const small = "w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-primary";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500">Cost price shudhu tumi ar admin dekhte pabe</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Plus size={18} /> Add product
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={addProduct} className="mt-6 grid gap-3 rounded-3xl border border-black/5 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3">
          <input required placeholder="Product name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
          <input required placeholder="Unit (per kg, per litre...)" className={input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input required type="number" min="1" placeholder="Selling price (৳)" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input required type="number" min="0" placeholder="Cost price (৳)" className={input} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          <input required type="number" min="0" placeholder="Stock" className={input} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <button disabled={pending} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 lg:col-span-3">
            {pending ? "Saving..." : "Save product"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-black/5 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Selling price</th>
              <th className="px-5 py-3">Cost price</th>
              <th className="px-5 py-3">Profit / unit</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => {
              const editing = editId === p.id;
              const profit = p.price - p.costPrice;
              return (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {p.emoji} {p.name}
                    <span className="block text-xs font-normal text-gray-500">{p.category} · {p.unit}</span>
                  </td>
                  <td className="px-5 py-3">
                    {editing ? <input className={small} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /> : formatPrice(p.price)}
                  </td>
                  <td className="px-5 py-3">
                    {editing ? <input className={small} value={draft.costPrice} onChange={(e) => setDraft({ ...draft, costPrice: e.target.value })} /> : formatPrice(p.costPrice)}
                  </td>
                  <td className={`px-5 py-3 font-semibold ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {profit >= 0 ? "+" : "-"}{formatPrice(Math.abs(profit))}
                  </td>
                  <td className="px-5 py-3">
                    {editing ? (
                      <input className={small} value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
                    ) : p.stock === 0 ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Out of stock</span>
                    ) : p.stock <= 30 ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Low: {p.stock}</span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {editing ? (
                        <>
                          <button
                            disabled={pending}
                            onClick={() =>
                              run(
                                () =>
                                  updateProduct(p.id, {
                                    price: Number(draft.price),
                                    costPrice: Number(draft.costPrice),
                                    stock: Number(draft.stock),
                                  }),
                                () => setEditId(null)
                              )
                            }
                            className="rounded-full bg-green-100 p-2 text-green-700"
                          >
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditId(null)} className="rounded-full bg-gray-100 p-2 text-gray-600"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"><Pencil size={16} /></button>
                          <button
                            disabled={pending}
                            onClick={() => confirm(`"${p.name}" delete korbe?`) && run(() => deleteProduct(p.id))}
                            className="rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}