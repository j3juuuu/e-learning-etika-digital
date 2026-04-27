import DashboardClient from '../dashboard-client';

type DashboardPageProps = {
  params: Promise<{ section?: string[] }>;
};

const sectionMap: Record<string, string> = {
  'materi-pembelajaran': 'learning',
  'kelas-saya': 'classroom',
  'progres-belajar': 'progress',
  'presensi': 'attendance',
  'admin': 'admin',
  'skor-toksisitas': 'score',
  'saran-perbaikan': 'improvements',
  'indikator-pemicu': 'triggers',
  'modul-pembelajaran': 'learning',
  'log-latihan': 'classroom',
  'progres': 'progress',
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { section: [] },
    ...Object.keys(sectionMap).map((section) => ({ section: [section] })),
  ];
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await params;
  const sectionKey = resolvedParams.section?.[0];
  const activeSection = sectionKey ? sectionMap[sectionKey] ?? 'overview' : 'overview';

  return <DashboardClient activeSection={activeSection} />;
}
