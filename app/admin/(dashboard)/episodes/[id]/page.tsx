import { notFound } from "next/navigation";
import EpisodeEditor from "@/components/admin/episode-editor";
import { getEpisodeById } from "@/lib/store";

export default async function EpisodeEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  if (id === "new") return <EpisodeEditor />;

  const episode = await getEpisodeById(id);
  if (!episode) notFound();

  return <EpisodeEditor episode={episode} saved={Boolean(saved)} />;
}
