import { GamepadIcon, TiktokIcon } from '@/components/ui/icons';
import { formatPlace, formatWhen, scheduleLink } from './jadwalformat';

//Kartu jadwal beranda. big = kartu besar di kiri, selain itu kartu kecil di samping
//preview = tampilan di form admin, tanpa link
export default function JadwalCard({ schedule, settings, big = false, preview = false, className = '' }) {
  const Icon = schedule.type === 'room_match' ? GamepadIcon : TiktokIcon;
  const place = formatPlace(schedule, settings);
  const link = preview ? null : scheduleLink(schedule, settings);

  const content = (
    <>
      <span
        className={`grid shrink-0 place-items-center rounded bg-neutral-900 text-white ${
          big ? 'h-20 w-20' : 'h-12 w-12'
        }`}
      >
        <Icon className={big ? 'h-10 w-10' : 'h-6 w-6'} />
      </span>
      <div className="min-w-0">
        <h3 className={big ? 'text-2xl font-semibold text-slate-900' : 'font-semibold text-slate-900'}>
          {schedule.title || 'Judul jadwal'}
        </h3>
        <p className={big ? 'mt-2 text-slate-600' : 'mt-1 text-xs text-slate-600'}>
          {formatWhen(schedule)}
          {place && ` · ${place}`}
        </p>
      </div>
    </>
  );

  const boxClass = `flex items-center rounded-sm bg-white ${big ? 'gap-5 p-8' : 'gap-4 p-5'} ${className}`;

  if (!link) return <div className={boxClass}>{content}</div>;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`${boxClass} transition-all duration-300 hover:ring-2 hover:ring-orange-500`}
    >
      {content}
    </a>
  );
}
