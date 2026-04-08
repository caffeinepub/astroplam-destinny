import { useActor } from "@/hooks/useActor";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  active: boolean;
  createdAt: bigint;
  message: string;
}

export default function NoticeBoardSection() {
  const { actor } = useActor();
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    if (!actor) return;
    (actor as any)
      .noticeList()
      .then((list: Notice[]) => {
        setNotices(list.filter((n) => n.active));
      })
      .catch(() => {});
  }, [actor]);
  if (notices.length === 0) return null;
  return (
    <section className="py-8 px-4 bg-amber-50/60">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-gold-dark" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gold-dark">
            Notice Board
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl p-4 border border-gold/20 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-base mb-1 text-gold-dark">
                {notice.title}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal/70">
                {notice.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
