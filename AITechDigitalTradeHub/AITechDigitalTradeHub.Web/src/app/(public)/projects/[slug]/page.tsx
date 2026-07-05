import { ProjectDetailClient } from "@/features/projects/components/project-detail-client";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projectId = Number(slug);

  return (
    <section className="py-6 md:py-10">
      <div className="container-page">
        {Number.isFinite(projectId) && projectId > 0 ? (
          <ProjectDetailClient projectId={projectId} />
        ) : (
          <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">شناسه پروژه معتبر نیست.</div>
        )}
      </div>
    </section>
  );
}
