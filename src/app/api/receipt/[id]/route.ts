import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ReceiptDocument from "@/components/orders/ReceiptDocument";
import { getOrderById, getSellerShop } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Please log in" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ message: "Order paoa jayni" }, { status: 404 });

  let allowed = user.role === "admin" || order.userId === user.id;
  if (!allowed && user.role === "seller") {
    const shop = await getSellerShop();
    allowed = !!shop && shop.id === order.shopId;
  }
  if (!allowed) return NextResponse.json({ message: "Ei receipt dekhar permission nai" }, { status: 403 });

  const buffer = await renderToBuffer(ReceiptDocument({ order }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Receipt-${order.code}.pdf"`,
    },
  });
}