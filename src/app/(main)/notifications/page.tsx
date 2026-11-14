import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getNotifications } from "@/lib/engage";
import { markAllRead } from "@/app/notification-actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getNotifications(user.id);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{unread} new</p>
        </div>
        {unread > 0 && (
          <form action={markAllRead}>
            <button className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-600">No notifications yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((n) => {
            const body = (
              <div
                className={`rounded-2xl border p-4 ${
                  n.read ? "border-black/5 bg-white" : "border-primary/20 bg-primary-light"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-900">{n.title}</p>
                  {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />}
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}