import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ReceiptDocument from "@/components/orders/ReceiptDocument";
import { getOrderById } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ message: "Order paoa jayni" }, { status: 404 });
  }

  const buffer = await renderToBuffer(ReceiptDocument({ order }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Receipt-${order.code}.pdf"`,
    },
  });
}