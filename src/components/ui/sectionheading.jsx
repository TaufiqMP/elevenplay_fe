export default function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-1 text-slate-700">{subtitle}</p>}
    </div>
  );
}