import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import BlogSection from "./components/BlogSection";
import ComparisonTable from "./components/ComparisonTable";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import NoticeBoardSection from "./components/NoticeBoardSection";
import ProfileSetupModal from "./components/ProfileSetupModal";
import ServiceGrid from "./components/ServiceGrid";
import ServicesSection from "./components/ServicesSection";
import SpecialUniqueServiceSection from "./components/SpecialUniqueServiceSection";
import VisitorQueryForm from "./components/VisitorQueryForm";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetAllPosts, useGetCallerUserProfile } from "./hooks/useQueries";
import type { BlogPost } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import CoursesPage from "./pages/CoursesPage";

import HoroscopePage from "./pages/HoroscopePage";
import NadiCardsPage from "./pages/NadiCardsPage";
import NumerologyPage from "./pages/NumerologyPage";
import PredictionDetailPage from "./pages/PredictionDetailPage";
import PredictionOptionsPage from "./pages/PredictionOptionsPage";

interface Notice {
  id: string;
  title: string;
  message: string;
  active: boolean;
}

// LatestUpdates: LIGHT THEME (was dark #111111 - now white/cream)
function LatestUpdates() {
  const { actor } = useActor();
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    if (!actor) return;
    (actor as any)
      .noticeList()
      .then((list: Notice[]) => {
        setNotices(list.filter((n: Notice) => n.active).slice(0, 6));
      })
      .catch(() => {});
  }, [actor]);
  if (notices.length === 0) return null;
  return (
    <section className="py-10 px-4 bg-amber-50/60">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gold-dark font-serif">
          Notice Board
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl border border-gold/30 p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-sm mb-2 text-gold-dark">
                {notice.title}
              </h3>
              <p className="text-xs text-charcoal/70">{notice.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestBlogPosts() {
  const { data: posts, isLoading } = useGetAllPosts();
  const recent = (posts ?? []).slice(0, 3);
  const formatDate = (post: BlogPost) => {
    const raw = (post as any).createdAt ?? (post as any).publishedAt ?? null;
    if (!raw) return "";
    try {
      const ms =
        typeof raw === "bigint" ? Number(raw) / 1_000_000 : Number(raw);
      return new Date(ms).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };
  const excerpt = (content: string) => {
    const plain = content.replace(/<[^>]+>/g, "");
    return plain.length > 120 ? `${plain.slice(0, 120)}\u2026` : plain;
  };
  return (
    <section id="blog-notices" className="py-12 px-4 bg-amber-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold-dark font-serif">
            Latest Blog Posts
          </h2>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("blog")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-sm font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer bg-gold-dark text-white hover:bg-gold"
            data-ocid="blog_notices.button"
          >
            View All &rarr;
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl h-40 animate-pulse bg-gray-200"
                data-ocid="blog_notices.loading_state"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center bg-white border border-amber-100"
            data-ocid="blog_notices.empty_state"
          >
            <span className="text-4xl mb-3 block">&#128240;</span>
            <p className="font-semibold text-gold-dark">
              Stay tuned for updates
            </p>
            <p className="text-sm mt-1 text-charcoal/50">
              Blog posts and notices will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((post, i) => (
              <div
                key={post.id}
                className="rounded-2xl p-5 flex flex-col gap-2 transition-transform hover:scale-[1.02] bg-white border border-amber-100 shadow-sm"
                data-ocid={`blog_notices.item.${i + 1}`}
              >
                <p className="text-xs font-medium text-charcoal/50">
                  {formatDate(post)}
                </p>
                <h3 className="font-bold text-sm leading-snug text-charcoal">
                  {post.title}
                </h3>
                <p className="text-xs leading-relaxed text-charcoal/60">
                  {excerpt(post.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HomePage() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;
  return (
    <div className="bg-amber-50/30 font-sans overflow-x-hidden w-full">
      <Header />
      <main className="overflow-x-hidden w-full">
        <HeroSection />
        <ServiceGrid />
        <LatestUpdates />
        <LatestBlogPosts />
        <section id="send-query" className="py-6 md:py-10 bg-amber-50/50">
          <div className="max-w-xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-charcoal mb-2">
                Send Us Your Query
              </h2>
              <p className="text-charcoal/50 text-sm md:text-base">
                Have a question? Fill out the form below and we will get back to
                you.
              </p>
            </div>
            <div className="bg-white/80 rounded-2xl border border-amber-100 shadow-sm p-6 md:p-8">
              <VisitorQueryForm />
            </div>
          </div>
        </section>
        <section id="services">
          <ServicesSection />
        </section>
        <NoticeBoardSection />
        <section id="blog">
          <BlogSection />
        </section>
        <ComparisonTable />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors position="top-right" />
    </div>
  );
}

function SpecialServicesPage() {
  return (
    <div>
      <Header />
      <SpecialUniqueServiceSection />
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const numerologyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/numerology",
  component: NumerologyPage,
});
const nadiCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nadi-cards",
  component: NadiCardsPage,
});
const predictionOptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/numerology/prediction",
  component: PredictionOptionsPage,
});
const predictionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/numerology/prediction/$type",
  component: PredictionDetailPage,
});
const horoscopeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/horoscope",
  component: HoroscopePage,
});
const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: CoursesPage,
});
const specialServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/special-services",
  component: SpecialServicesPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const routeTree = rootRoute.addChildren([
  indexRoute,
  numerologyRoute,
  nadiCardsRoute,
  predictionOptionsRoute,
  predictionDetailRoute,
  horoscopeRoute,

  coursesRoute,
  specialServicesRoute,
  adminRoute,
]);
const history = createBrowserHistory();
const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
