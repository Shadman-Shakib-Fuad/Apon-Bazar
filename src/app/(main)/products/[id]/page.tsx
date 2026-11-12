import Link from "next/link";
import { notFound } from "next/navigation";
import { TrendingUp, TrendingDown, Store } from "lucide-react";
import { getProduct, getProducts, getPriceHistory } from "@/lib/data";
import { formatPrice, priceDiff } from "@/lib/utils";
import PriceHistoryChart from "@/components/shop/PriceHistoryChart";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductCard from "@/components/shop/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const diff = priceDiff(product.price, product.yesterdayPrice);
  const [{ points, ups, downs }, sameCategory] = await Promise.all([
    getPriceHistory(product.id),
    getProducts({ category: product.category }),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex h-72 items-center justify-center rounded-3xl bg-primary-light text-9xl md:h-96">
          {product.emoji}
        </div>

        <div>
          <p className="text-sm font-medium text-primary">{product.category}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">{product.name}</h1>

          <Link
            href={`/shops/${product.shopId}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary"
          >
            <Store size={16} /> {product.shopName}
          </Link>

          <p className="mt-5 text-4xl font-extrabold text-gray-900">
            {formatPrice(product.price)}
            <span className="ml-2 text-base font-normal text-gray-500">{product.unit}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
              Yesterday: {formatPrice(product.yesterdayPrice)}
            </span>
            {diff > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-medium text-red-600">
                <TrendingUp size={14} /> Increased {formatPrice(diff)}
              </span>
            )}
            {diff < 0 && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                <TrendingDown size={14} /> Decreased {formatPrice(Math.abs(diff))}
              </span>
            )}
            {diff === 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">
                No change today
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Price history */}
      <section className="mt-10 rounded-3xl border border-black/5 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Price History (last 7 days)</h2>
          <div className="flex gap-2 text-xs font-medium">
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
              Increased {ups} times
            </span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
              Decreased {downs} times
            </span>
          </div>
        </div>
        <PriceHistoryChart data={points} />
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Related products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}