import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ORDER_STEPS } from "@/lib/orders";
import type { OrderView } from "@/types";

// PDF er default font e ৳ chinha nai, tai "Tk" likhchi
const tk = (n: number) => `Tk ${n.toLocaleString("en-US")}`;

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937", backgroundColor: "#ffffff" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 18,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { color: "#ffffff", fontSize: 20, fontFamily: "Helvetica-Bold" },
  tagline: { color: "#c8e6c9", fontSize: 9, marginTop: 3 },
  receiptWord: { color: "#ffffff", fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  receiptNo: { color: "#ffe0b2", fontSize: 10, marginTop: 3, textAlign: "right" },
  accent: { height: 4, backgroundColor: "#f57c00", marginTop: 4, borderRadius: 2 },

  infoRow: { flexDirection: "row", marginTop: 18 },
  infoBox: { flex: 1, backgroundColor: "#faf7f2", borderRadius: 6, padding: 10, marginRight: 8 },
  infoBoxLast: { marginRight: 0 },
  label: { fontSize: 8, color: "#6b7280", marginBottom: 4 },
  value: { fontSize: 10, marginBottom: 2 },
  bold: { fontFamily: "Helvetica-Bold" },

  tableHead: {
    flexDirection: "row",
    backgroundColor: "#2e7d32",
    padding: 7,
    marginTop: 20,
    borderRadius: 4,
  },
  th: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  row: { flexDirection: "row", padding: 7, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  cName: { flex: 4 },
  cQty: { flex: 1, textAlign: "center" },
  cPrice: { flex: 2, textAlign: "right" },
  cAmt: { flex: 2, textAlign: "right" },
  unit: { fontSize: 8, color: "#6b7280" },

  totals: { marginTop: 14, alignSelf: "flex-end", width: 210 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  grandText: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#e65100" },

  payment: { marginTop: 18, backgroundColor: "#e8f5e9", borderRadius: 6, padding: 10 },
  footer: { position: "absolute", bottom: 26, left: 32, right: 32, textAlign: "center", color: "#6b7280", fontSize: 9 },
});

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ReceiptDocument({ order }: { order: OrderView }) {
  const date = new Date(order.createdAt).toLocaleString("en-GB");

  return (
    <Document title={`Receipt ${order.code}`} author="Apon Bazar">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Apon Bazar</Text>
            <Text style={styles.tagline}>Apon manush, apon dokan</Text>
          </View>
          <View>
            <Text style={styles.receiptWord}>RECEIPT</Text>
            <Text style={styles.receiptNo}>#{order.code}</Text>
          </View>
        </View>
        <View style={styles.accent} />

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>RECEIPT INFO</Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>No: </Text>
              {order.code}
            </Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>Date: </Text>
              {date}
            </Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>Order status: </Text>
              {order.cancelled ? "Cancelled" : ORDER_STEPS[order.statusIndex]}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>SHOP</Text>
            <Text style={[styles.value, styles.bold]}>{order.shopName}</Text>
            <Text style={styles.value}>
              {order.deliveryType === "home" ? "Home delivery" : "Shop pickup"}
            </Text>
          </View>

          <View style={[styles.infoBox, styles.infoBoxLast]}>
            <Text style={styles.label}>CUSTOMER</Text>
            <Text style={[styles.value, styles.bold]}>{order.customerName}</Text>
            <Text style={styles.value}>{order.phone}</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.cName]}>Item</Text>
          <Text style={[styles.th, styles.cQty]}>Qty</Text>
          <Text style={[styles.th, styles.cPrice]}>Unit price</Text>
          <Text style={[styles.th, styles.cAmt]}>Amount</Text>
        </View>

        {order.items.map((i, idx) => (
          <View key={idx} style={styles.row} wrap={false}>
            <View style={styles.cName}>
              <Text>{i.name}</Text>
              <Text style={styles.unit}>{i.unit}</Text>
            </View>
            <Text style={styles.cQty}>{i.qty}</Text>
            <Text style={styles.cPrice}>{tk(i.price)}</Text>
            <Text style={styles.cAmt}>{tk(i.price * i.qty)}</Text>
          </View>
        ))}

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{tk(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Discount</Text>
            <Text>{tk(0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Delivery charge</Text>
            <Text>{tk(order.deliveryCharge)}</Text>
          </View>
          <View style={styles.grand}>
            <Text style={styles.grandText}>Total bill</Text>
            <Text style={styles.grandText}>{tk(order.total)}</Text>
          </View>
        </View>

        <View style={styles.payment} wrap={false}>
          <Text style={styles.label}>PAYMENT</Text>
          <Text style={styles.value}>
            <Text style={styles.bold}>Method: </Text>
            {order.paymentMethod}
          </Text>
          <Text style={styles.value}>
            <Text style={styles.bold}>Status: </Text>
            {cap(order.paymentStatus)}
          </Text>
          <Text style={styles.value}>
            <Text style={styles.bold}>Transaction ID: </Text>
            {order.transactionId || "-"}
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          Thank you for shopping with Apon Bazar. This is a computer generated receipt.
        </Text>
      </Page>
    </Document>
  );
}