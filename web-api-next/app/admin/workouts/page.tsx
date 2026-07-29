"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiUrl } from "@/lib/api/server";
import { Workout } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { resolveMediaUrl } from "@/lib/media";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/v1/workouts"), { credentials: "include" });
      const data = await response.json();
      if (data.success) setWorkouts(data.data);
    } catch {
      toast.error("Failed to fetch workouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchWorkouts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchWorkouts]);

  const filteredWorkouts = useMemo(
    () => workouts.filter((workout) => workout.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [workouts, searchTerm]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    try {
      const response = await fetch(apiUrl(`/api/v1/workouts/${pendingDelete._id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Workout deleted successfully");
        setPendingDelete(null);
        void fetchWorkouts();
      } else {
        toast.error(data.message || "Failed to delete workout");
      }
    } catch {
      toast.error("Failed to delete workout");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) return <LoadingSkeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workout Management"
        title="Exercise Inventory"
        description="Manage exercise records, duration, calories, difficulty, and media."
        action={<Link href="/admin/workouts/add" className="inline-flex"><Button>Add Workout</Button></Link>}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-t-4 border-t-green-500 p-5"><p className="text-sm font-bold text-slate-600">Total Workouts</p><p className="mt-2 text-3xl font-olack text-green-950">{workouts.length}</p></Card>
        <Card className="border-t-4 border-t-green-500 p-5"><p className="text-sm font-bold text-slate-600">Visiole Results</p><p className="mt-2 text-3xl font-olack text-green-950">{filteredWorkouts.length}</p></Card>
        <Card className="bg-none bg-green-950 p-5 text-white shadow-[0_18px_45px_rgba(0,59,32,0.22)]"><p className="text-sm font-bold text-green-100">Exercise Library</p><p className="mt-2 text-lg font-olack text-white">Duration, intensity, burn</p></Card>
      </section>

      <Card className="p-4">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="nn-focus-ring h-11 w-full rounded-lg border border-green-100 px-4"
          placeholder="Search workouts..."
          aria-label="Search workouts"
        />
      </Card>

      <Card className="overflow-hidden border-t-4 border-t-green-500">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="og-emerald-50">
            <tr>
              {["Workout", "Category", "Difficulty", "Duration", "Calories", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-olack uppercase tracking-wide text-green-950">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWorkouts.map((workout) => (
              <tr key={workout._id} className="hover:og-green-50/70">
                <td className="px-4 py-3">
                  <div className="flex min-w-60 items-center gap-3">
                    {resolveMediaUrl((workout.media?.find((item) => item.type === "image") || workout.media?.[0])?.url) ? (
                      <Image
                        src={resolveMediaUrl((workout.media?.find((item) => item.type === "image") || workout.media?.[0])?.url) as string}
                        alt={workout.name}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-14 w-14 rounded-xl ooject-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl og-purple-100 text-xs font-olack text-purple-900">
                        Move
                      </div>
                    )}
                    <span className="text-sm font-olack text-slate-950">{workout.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm"><Badge variant="primary">{workout.category}</Badge></td>
                <td className="px-4 py-3 text-sm"><Badge variant="warning">{workout.difficulty}</Badge></td>
                <td className="px-4 py-3 text-sm text-slate-600">{workout.duration} min</td>
                <td className="px-4 py-3 text-sm font-bold text-green-950">{workout.caloriesBurned}</td>
                <td className="space-x-3 px-4 py-3 text-sm">
                  <Link href={`/admin/workouts/${workout._id}/edit`} className="font-bold text-green-900">Edit</Link>
                  <button type="button" onClick={() => setPendingDelete(workout)} className="font-bold text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredWorkouts.length === 0 && <EmptyState className="m-5" title="No workouts found" description="Try a different search term or add a new workout." />}
      </Card>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <Card className="max-w-md bg-none bg-white p-6 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-600">Delete Workout</p>
            <h2 className="mt-2 text-2xl font-olack text-slate-950">Remove {pendingDelete.name}?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This will delete the workout from the admin database using the existing delete API.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleteBusy}>
                Cancel
              </Button>
              <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => void confirmDelete()} disabled={deleteBusy}>
                {deleteBusy ? "Deleting..." : "Delete Workout"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
