export function PageShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-6 md:py-10">
      <div className="container-page">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-black leading-9 md:text-3xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-8 text-muted">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
