'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser, type StoredUser } from '../lib/auth';
import {
  getAttendanceByUser,
  getTodayAttendance,
  hasCheckedInToday,
  markAttendance,
  type AttendanceRecord,
} from '../lib/attendance';

type AnalysisResult = {
  toxicityScore: number;
  riskLevel: string;
  category: string;
  suggestions: string[];
  triggers: string[];
  improvedComment: string;
  explanation: string;
  learningPoints: string[];
  ethicsModule: string;
};

type ExerciseLogItem = {
  id: number;
  name: string;
  date: string;
  completed: boolean;
};

type DashboardClientProps = {
  activeSection: string;
};

type ModuleLearningStatus = 'belum-dipelajari' | 'sedang-dipelajari' | 'selesai';
type ClassroomTab = 'diikuti' | 'fundamental' | 'spesialis' | 'praktik' | 'tugas' | 'leaderboard' | 'forum';
type ForumMessageRole = 'student' | 'moderator' | 'chatbot';
type ForumMessageStatus = 'normal' | 'blocked';

type LearningModuleProgress = Record<string, { status: ModuleLearningStatus; bookmarked: boolean }>;
type ForumMessage = {
  id: number;
  author: string;
  role: ForumMessageRole;
  text: string;
  time: string;
  status: ForumMessageStatus;
};

type AnalysisLogEntry = {
  id: number;
  time: string;
  input: string;
  finalScore: number;
  status: string;
};
type AdminRole = 'mahasiswa' | 'mentor' | 'admin';
type StudentAccount = {
  id: number;
  name: string;
  nim: string;
  role: AdminRole;
  active: boolean;
};
type MinimumTestCase = {
  id: number;
  text: string;
  expectedScore: number;
};

type PersistedDashboardState = {
  comment: string;
  analysis: AnalysisResult | null;
  analysisLogs: AnalysisLogEntry[];
  exerciseLog: ExerciseLogItem[];
  progress: number;
  newExercise: string;
  learningModuleProgress: LearningModuleProgress;
  classroomActiveTab: ClassroomTab;
  forumMessages: ForumMessage[];
  forumDraft: string;
  chatbotDraft: string;
  chatbotReply: string;
};

function getPersistedDashboardState(): PersistedDashboardState {
  if (typeof window === 'undefined') {
    return {
      comment: '',
      analysis: null,
      analysisLogs: [],
      exerciseLog: [],
      progress: 0,
      newExercise: '',
      learningModuleProgress: {},
      classroomActiveTab: 'diikuti',
      forumMessages: [],
      forumDraft: '',
      chatbotDraft: '',
      chatbotReply: '',
    };
  }

  const rawState = window.localStorage.getItem('dashboard-state');
  if (!rawState) {
    return {
      comment: '',
      analysis: null,
      analysisLogs: [],
      exerciseLog: [],
      progress: 0,
      newExercise: '',
      learningModuleProgress: {},
      classroomActiveTab: 'diikuti',
      forumMessages: [],
      forumDraft: '',
      chatbotDraft: '',
      chatbotReply: '',
    };
  }

  try {
    return JSON.parse(rawState) as PersistedDashboardState;
  } catch {
    window.localStorage.removeItem('dashboard-state');
    return {
      comment: '',
      analysis: null,
      analysisLogs: [],
      exerciseLog: [],
      progress: 0,
      newExercise: '',
      learningModuleProgress: {},
      classroomActiveTab: 'diikuti',
      forumMessages: [],
      forumDraft: '',
      chatbotDraft: '',
      chatbotReply: '',
    };
  }
}

const sectionConfig = [
  { id: 'overview', href: '/dashboard', label: 'Panel Utama' },
  { id: 'learning', href: '/dashboard/materi-pembelajaran', label: 'Materi Pembelajaran' },
  { id: 'classroom', href: '/dashboard/kelas-saya', label: 'Kelas Saya' },
  { id: 'progress', href: '/dashboard/progres-belajar', label: 'Progres Belajar' },
  { id: 'attendance', href: '/dashboard/presensi', label: 'Presensi' },
] as const;

const bottomSectionConfig = [{ id: 'admin', href: '/dashboard/admin', label: 'Admin' }] as const;
const menuIcons: Record<string, string> = {
  overview: 'PU',
  learning: 'MP',
  classroom: 'KS',
  progress: 'PB',
  attendance: 'PR',
  admin: 'AD',
};

const programs = ['Privasi Digital', 'Etika Bermedia Sosial', 'Deteksi Risiko Perilaku', 'Literasi AI'];
const learningModules = [
  {
    id: 'learning-path',
    title: 'Learning Path',
    summary: 'Pahami urutan belajar yang tepat: kenali masalah, cek dampak komentar, lalu latih cara menulis tanggapan yang lebih empatik.',
    ethicsRules: [
      'Kritik perilaku atau isi, bukan menyerang identitas pribadi.',
      'Gunakan bahasa yang spesifik, sopan, dan bisa ditindaklanjuti.',
      'Pastikan tujuan komentar adalah perbaikan, bukan mempermalukan.',
    ],
    caseStudy: {
      context: 'Di forum kelas, tugas teman terlambat dikumpulkan.',
      unethicalComment: '"Kamu emang pemalas, dari dulu selalu bikin kelompok rugi."',
      improvedComment: '"Tugasmu belum masuk dan itu berdampak ke kelompok. Bisa dibantu update kapan bisa selesai?"',
      fixReason: 'Perbaikan ini mengubah serangan personal menjadi umpan balik yang fokus pada masalah dan solusi.',
    },
  },
  {
    id: 'mengenal-toxic',
    title: 'Mengenal Perilaku Toxic',
    summary: 'Perilaku toxic ditandai oleh hinaan, sarkasme merendahkan, ancaman, atau ajakan menyerang orang lain di ruang digital.',
    ethicsRules: [
      'Hindari kata merendahkan seperti "bodoh", "goblok", atau label negatif lain.',
      'Jangan mendorong perundungan massal (dogpiling) pada satu orang.',
      'Berhenti sejenak sebelum mengirim komentar saat emosi sedang tinggi.',
    ],
    caseStudy: {
      context: 'Komentar pada video presentasi teman yang masih banyak kekurangan.',
      unethicalComment: '"Presentasi kamu jelek banget, mending jangan tampil lagi."',
      improvedComment: '"Bagian pembuka sudah jelas. Supaya lebih kuat, coba tambahkan data pendukung di bagian inti."',
      fixReason: 'Perbaikan mempertahankan evaluasi, tetapi disampaikan secara membangun dan tetap menghargai lawan bicara.',
    },
  },
  {
    id: 'literasi-digital-ai',
    title: 'Literasi Digital & AI',
    summary: 'Gunakan AI secara bertanggung jawab: verifikasi fakta, jaga privasi data, dan tetap utamakan etika dalam berkomunikasi.',
    ethicsRules: [
      'Jangan membagikan data pribadi sensitif ke AI atau publik.',
      'Periksa ulang informasi dari AI sebelum disebarkan.',
      'Gunakan AI untuk membantu belajar, bukan untuk menyalin mentah tanpa pemahaman.',
    ],
    caseStudy: {
      context: 'Diskusi online tentang isu yang sedang viral, lalu ada jawaban dari AI yang belum diverifikasi.',
      unethicalComment: '"Ini faktanya, baca dulu! Kamu jelas nggak ngerti apa-apa."',
      improvedComment: '"Aku menemukan informasi ini dari AI, tapi sebaiknya kita cek sumber resminya dulu agar tidak salah paham."',
      fixReason: 'Perbaikan menghapus nada merendahkan dan menambahkan sikap kritis terhadap sumber informasi.',
    },
  },
] as const;

const moduleStatusLabel: Record<ModuleLearningStatus, string> = {
  'belum-dipelajari': 'Belum dipelajari',
  'sedang-dipelajari': 'Sedang dipelajari',
  selesai: 'Selesai',
};

const classroomTabs: Array<{ id: ClassroomTab; label: string }> = [
  { id: 'diikuti', label: 'Kelas Diikuti' },
  { id: 'fundamental', label: 'Kelas Fundamental' },
  { id: 'spesialis', label: 'Kelas Spesialis' },
  { id: 'praktik', label: 'Kelas Praktik' },
  { id: 'tugas', label: 'Tugas & Latihan Analisis' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'forum', label: 'Forum Diskusi + Chat Bot' },
];

const joinedClassList = [
  { title: 'Etika Komunikasi Digital', mentor: 'Bu Rina', progress: 78, badge: 'Aktif' },
  { title: 'Literasi AI untuk Pelajar', mentor: 'Pak Bayu', progress: 52, badge: 'Aktif' },
  { title: 'Kolaborasi Tim Online', mentor: 'Bu Yuni', progress: 34, badge: 'Perlu latihan' },
];

const fundamentalClassList = [
  { title: 'Dasar Etika Bermedia', description: 'Memahami sopan santun digital dan jejak komunikasi.' },
  { title: 'Privasi & Keamanan Akun', description: 'Melindungi data pribadi saat belajar online.' },
  { title: 'Empati dalam Komentar', description: 'Menulis kritik yang tetap menghargai orang lain.' },
];

const specialistClassList = [
  { title: 'Moderasi Konten Berbasis AI', description: 'Membaca pola kata kasar, hinaan, dan provokasi.' },
  { title: 'Forensik Jejak Digital', description: 'Menganalisis dampak komentar terhadap reputasi digital.' },
  { title: 'Strategi Komunikasi Krisis', description: 'Menangani konflik kelas dengan bahasa yang de-eskalatif.' },
];

const practiceClassList = [
  { title: 'Simulasi Revisi Komentar Kasar', target: '12 skenario', targetCount: 12, done: 8 },
  { title: 'Debat Terstruktur dan Etis', target: '6 sesi', targetCount: 6, done: 4 },
  { title: 'Latihan Peer Review Positif', target: '15 umpan balik', targetCount: 15, done: 10 },
];

const leaderboardData = [
  { rank: 1, name: 'Nadia', score: 960, streak: '15 hari' },
  { rank: 2, name: 'Rafi', score: 925, streak: '12 hari' },
  { rank: 3, name: 'Sinta', score: 910, streak: '10 hari' },
  { rank: 4, name: 'Dimas', score: 860, streak: '8 hari' },
  { rank: 5, name: 'Alya', score: 830, streak: '7 hari' },
];

const initialStudentAccounts: StudentAccount[] = [
  { id: 1, name: 'Alya Putri', nim: '2311001', role: 'mahasiswa', active: true },
  { id: 2, name: 'Rafi Pratama', nim: '2311002', role: 'mahasiswa', active: true },
  { id: 3, name: 'Nadia Rahma', nim: '2311003', role: 'mentor', active: true },
  { id: 4, name: 'Dimas Akbar', nim: '2311004', role: 'mahasiswa', active: false },
];

const initialCustomerReports = [
  { id: 1, reporter: 'Nadia', issue: 'Komentar forum terlalu keras', status: 'Ditinjau' },
  { id: 2, reporter: 'Rafi', issue: 'Butuh contoh rephrase tambahan', status: 'Diproses' },
  { id: 3, reporter: 'Alya', issue: 'Salah deteksi kata netral', status: 'Selesai' },
];

const highRiskTerms = ['bodoh', 'tolol', 'jelek', 'malas', 'goblok', 'benci'];
const mediumRiskTerms = ['parah', 'buruk', 'payah', 'nggak becus', 'kesel'];
const minimumTestCases: MinimumTestCase[] = [
  { id: 1, text: 'Kamu bodoh sekali saat menjelaskan materi ini.', expectedScore: 82 },
  { id: 2, text: 'Dia tolol, tidak paham apa-apa.', expectedScore: 82 },
  { id: 3, text: 'Hasil presentasinya jelek dan memalukan.', expectedScore: 82 },
  { id: 4, text: 'Kamu malas belajar, selalu terlambat.', expectedScore: 82 },
  { id: 5, text: 'Jawabanmu goblok dan tidak masuk akal.', expectedScore: 82 },
  { id: 6, text: 'Saya benci cara kamu berbicara di forum.', expectedScore: 82 },
  { id: 7, text: 'Penjelasanmu parah, susah dipahami.', expectedScore: 58 },
  { id: 8, text: 'Kualitas tugas ini buruk untuk ukuran kelas.', expectedScore: 58 },
  { id: 9, text: 'Argumen kamu payah dan belum rapi.', expectedScore: 58 },
  { id: 10, text: 'Kamu nggak becus mengatur kerja kelompok.', expectedScore: 58 },
  { id: 11, text: 'Saya kesel karena revisinya tidak selesai.', expectedScore: 58 },
  { id: 12, text: 'Diskusinya parah dan arahnya tidak jelas.', expectedScore: 58 },
  { id: 13, text: 'Penjelasanmu cukup jelas, tinggal tambah contoh.', expectedScore: 24 },
  { id: 14, text: 'Terima kasih, masukannya membantu saya belajar.', expectedScore: 24 },
  { id: 15, text: 'Menurut saya argumennya baik, bisa diperdalam data.', expectedScore: 24 },
  { id: 16, text: 'Presentasi sudah rapi, mungkin tempo bicara diperlambat.', expectedScore: 24 },
  { id: 17, text: 'Saya setuju sebagian, mari kita bahas poin yang kurang.', expectedScore: 24 },
  { id: 18, text: 'Solusi ini menarik, mohon jelaskan langkah implementasi.', expectedScore: 24 },
  { id: 19, text: 'Pembahasan sudah tepat, tambahkan referensi agar kuat.', expectedScore: 24 },
  { id: 20, text: 'Komentar ini netral dan fokus pada perbaikan.', expectedScore: 24 },
];

function getTimeLabel() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function evaluateCommentRisk(rawComment: string) {
  const normalizedComment = rawComment.toLowerCase();
  const highRiskHit = highRiskTerms.some((term) => normalizedComment.includes(term));
  const mediumRiskHit = mediumRiskTerms.some((term) => normalizedComment.includes(term));

  const toxicityScore = highRiskHit ? 82 : mediumRiskHit ? 58 : 24;
  const riskLevel = highRiskHit ? 'Risiko tinggi' : mediumRiskHit ? 'Risiko sedang' : 'Risiko rendah';
  const category = highRiskHit ? 'Perlu revisi segera' : mediumRiskHit ? 'Perlu diperhalus' : 'Cukup aman';
  const improvedComment = highRiskHit
    ? 'Aku kurang setuju dengan hasil ini. Bisa kita bahas bagian mana yang masih perlu diperbaiki supaya lebih jelas?'
    : mediumRiskHit
      ? 'Menurutku hasilnya masih belum maksimal. Mungkin bisa diperbaiki lagi di bagian yang kurang jelas.'
      : 'Pendapatmu sudah cukup jelas. Akan lebih baik jika ditambahkan contoh agar lebih mudah dipahami.';

  const triggers = highRiskHit
    ? ['Kata yang merendahkan', 'Nada menyalahkan', 'Potensi memicu balasan agresif']
    : mediumRiskHit
      ? ['Nada frustrasi cukup kuat', 'Kalimat kurang empatik', 'Berpotensi menyinggung lawan bicara']
      : ['Bahasa relatif aman', 'Masih bisa dibuat lebih suportif', 'Perlu konteks tambahan agar tidak disalahpahami'];

  const explanation = highRiskHit
    ? 'AI mendeteksi kata-kata yang menyerang pribadi sehingga komentar berisiko memperburuk percakapan. Versi perbaikan mempertahankan kritik, tetapi mengganti nada menjadi lebih hormat dan terbuka untuk dialog.'
    : mediumRiskHit
      ? 'AI membaca adanya rasa kesal yang cukup kuat. Versi perbaikan tetap menyampaikan keberatan, namun menurunkan tensi agar pesan lebih mudah diterima.'
      : 'AI menilai komentar sudah cukup aman, tetapi masih bisa dibuat lebih konstruktif. Versi perbaikan menambahkan arah diskusi agar pembicaraan lebih bermanfaat.';

  return {
    toxicityScore,
    riskLevel,
    category,
    improvedComment,
    triggers,
    explanation,
  };
}

function getPageTitle(activeSection: string) {
  switch (activeSection) {
    case 'score':
      return 'Halaman Skor Toksisitas + Kategori';
    case 'improvements':
      return 'Halaman Saran Perbaikan';
    case 'triggers':
      return 'Halaman Penjelasan Indikator Pemicu';
    case 'learning':
      return 'Halaman Materi Pembelajaran';
    case 'classroom':
      return 'Halaman Kelas Saya';
    case 'attendance':
      return 'Halaman Presensi';
    case 'admin':
      return 'Halaman Admin';
    case 'progress':
      return 'Halaman Progres Belajar';
    default:
      return 'Halaman Panel Utama';
  }
}

export default function DashboardClient({ activeSection }: DashboardClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [isPresentToday, setIsPresentToday] = useState(false);
  const [attendanceFeatureActive, setAttendanceFeatureActive] = useState(true);
  const [qrDayKey] = useState(() => new Date().toISOString().slice(0, 10));
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [attendanceEthicsChecked, setAttendanceEthicsChecked] = useState(false);
  const [attendanceNotice, setAttendanceNotice] = useState('');
  const persistedState = getPersistedDashboardState();
  const [comment, setComment] = useState(persistedState.comment);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(persistedState.analysis);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogEntry[]>(persistedState.analysisLogs ?? []);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(initialStudentAccounts);
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(['bodoh', 'tolol', 'goblok', 'bangsat']);
  const [forbiddenWordInput, setForbiddenWordInput] = useState('');
  const [ethicsRubric, setEthicsRubric] = useState(
    'Rubrik etika v1.2: fokus pada perilaku, gunakan bahasa netral, dan sertakan saran perbaikan.',
  );
  const [rubricNotice, setRubricNotice] = useState('');
  const [uploadedModules, setUploadedModules] = useState<string[]>([
    'Modul Etika Dasar.pdf',
    'Literasi AI untuk Diskusi Kelas.pptx',
  ]);
  const [moduleUploadInput, setModuleUploadInput] = useState('');
  const [adminTasks, setAdminTasks] = useState<string[]>([
    'Review 20 komentar forum minggu ini',
    'Validasi dataset kata terlarang',
  ]);
  const [adminTaskInput, setAdminTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exerciseLog, setExerciseLog] = useState<ExerciseLogItem[]>(persistedState.exerciseLog);
  const [progress, setProgress] = useState(persistedState.progress);
  const [newExercise, setNewExercise] = useState(persistedState.newExercise);
  const [openedModuleId, setOpenedModuleId] = useState<string | null>(null);
  const [classroomActiveTab, setClassroomActiveTab] = useState<ClassroomTab>(
    classroomTabs.some((tab) => tab.id === persistedState.classroomActiveTab) ? persistedState.classroomActiveTab : 'diikuti',
  );
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>(
    (persistedState.forumMessages?.length ?? 0) > 0
      ? persistedState.forumMessages
      : [
        {
          id: -2,
          author: 'Moderator AI',
          role: 'moderator',
          text: 'Forum kelas aktif. Gunakan bahasa sopan dan fokus pada solusi.',
          time: getTimeLabel(),
          status: 'normal',
        },
        {
          id: -1,
          author: 'Chat Bot',
          role: 'chatbot',
          text: 'Butuh bantuan revisi komentar? Kirim pertanyaanmu di panel chat bot.',
          time: getTimeLabel(),
          status: 'normal',
        },
      ],
  );
  const [forumDraft, setForumDraft] = useState(persistedState.forumDraft ?? '');
  const [chatbotDraft, setChatbotDraft] = useState(persistedState.chatbotDraft ?? '');
  const [chatbotReply, setChatbotReply] = useState(persistedState.chatbotReply ?? '');
  const [learningModuleProgress, setLearningModuleProgress] = useState<LearningModuleProgress>(() => {
    const defaults = Object.fromEntries(
      learningModules.map((module) => [module.id, { status: 'belum-dipelajari' as ModuleLearningStatus, bookmarked: false }]),
    ) as LearningModuleProgress;

    return learningModules.reduce((accumulator, module) => {
      const persistedModule = persistedState.learningModuleProgress?.[module.id];
      accumulator[module.id] = {
        status: persistedModule?.status ?? defaults[module.id].status,
        bookmarked: persistedModule?.bookmarked ?? defaults[module.id].bookmarked,
      };
      return accumulator;
    }, {} as LearningModuleProgress);
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const syncUser = window.setTimeout(() => {
      markAttendance(user);
      setCurrentUser(user);
      setAttendanceHistory(getAttendanceByUser(user.email));
      setTodayAttendance(getTodayAttendance());
      setIsPresentToday(hasCheckedInToday(user.email));
    }, 0);

    return () => {
      window.clearTimeout(syncUser);
    };
  }, [router]);

  useEffect(() => {
    const payload: PersistedDashboardState = {
      comment,
      analysis,
      analysisLogs,
      exerciseLog,
      progress,
      newExercise,
      learningModuleProgress,
      classroomActiveTab,
      forumMessages,
      forumDraft,
      chatbotDraft,
      chatbotReply,
    };

    window.localStorage.setItem('dashboard-state', JSON.stringify(payload));
  }, [analysis, analysisLogs, chatbotDraft, chatbotReply, classroomActiveTab, comment, exerciseLog, forumDraft, forumMessages, learningModuleProgress, newExercise, progress]);

  const analyzeComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);

    window.setTimeout(() => {
      const evaluation = evaluateCommentRisk(comment);
      const toxicityScore = evaluation.toxicityScore;
      const ethicsScore = Math.max(0, 100 - toxicityScore);
      const finalStatus = evaluation.riskLevel === 'Risiko tinggi'
        ? 'Perlu bimbingan'
        : evaluation.riskLevel === 'Risiko sedang'
          ? 'Perlu perbaikan'
          : 'Etis';

      setAnalysis({
        toxicityScore: evaluation.toxicityScore,
        riskLevel: evaluation.riskLevel,
        category: evaluation.category,
        suggestions: [
          'Fokus pada isi masalah, bukan menyerang orangnya',
          'Gunakan kalimat yang mengajak diskusi, bukan memancing konflik',
          'Pilih kata yang lebih netral dan spesifik',
        ],
        triggers: evaluation.triggers,
        improvedComment: evaluation.improvedComment,
        explanation: evaluation.explanation,
        learningPoints: [
          'Kritik lebih efektif saat membahas tindakan atau hasil, bukan karakter seseorang.',
          'Bahasa yang tenang membuat lawan bicara lebih mungkin mendengarkan.',
          'Versi perbaikan membantu menjaga empati tanpa menghilangkan pesan utama.',
        ],
        ethicsModule: 'Modul Etika Digital: Komunikasi Online yang Empatik',
      });
      setAnalysisLogs((previous) => [
        {
          id: Date.now(),
          time: new Date().toLocaleString('id-ID'),
          input: comment.trim(),
          finalScore: ethicsScore,
          status: finalStatus,
        },
        ...previous,
      ].slice(0, 60));
      setLoading(false);
    }, 2000);
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    const exercise = {
      id: Date.now(),
      name: newExercise,
      date: new Date().toLocaleDateString(),
      completed: true,
    };
    setExerciseLog((previous) => [...previous, exercise]);
    setProgress((previous) => Math.min(previous + 10, 100));
    setNewExercise('');
  };

  const handleLogout = () => {
    window.localStorage.removeItem('dashboard-state');
    logoutUser();
    router.push('/login');
  };

  const updateModuleStatus = (moduleId: string, status: ModuleLearningStatus) => {
    setLearningModuleProgress((previous) => ({
      ...previous,
      [moduleId]: {
        status,
        bookmarked: previous[moduleId]?.bookmarked ?? false,
      },
    }));
  };

  const toggleModuleBookmark = (moduleId: string) => {
    setLearningModuleProgress((previous) => ({
      ...previous,
      [moduleId]: {
        status: previous[moduleId]?.status ?? 'belum-dipelajari',
        bookmarked: !(previous[moduleId]?.bookmarked ?? false),
      },
    }));
  };

  const moderateAndRewrite = (rawText: string) => {
    const normalized = rawText.toLowerCase();
    const toxicTerms = ['bodoh', 'tolol', 'goblok', 'anjing', 'jelek', 'bangsat', 'idiot', 'payah', 'benci'];
    const hasToxicTerm = toxicTerms.some((term) => normalized.includes(term));

    if (!hasToxicTerm) {
      return {
        blocked: false,
        suggestion: '',
      };
    }

    const rewritten = rawText
      .replace(/bodoh|tolol|goblok|anjing|bangsat|idiot/gi, 'kurang tepat')
      .replace(/jelek|payah/gi, 'masih perlu perbaikan')
      .replace(/benci/gi, 'kurang setuju');

    return {
      blocked: true,
      suggestion: `Saran moderator: "${rewritten}". Fokuskan komentar pada solusi dan bagian yang bisa diperbaiki.`,
    };
  };

  const getChatbotAnswer = (question: string) => {
    const normalized = question.toLowerCase();

    if (normalized.includes('contoh')) {
      return 'Contoh aman: "Argumenmu sudah bagus, mungkin akan lebih kuat jika ditambah sumber data."';
    }

    if (normalized.includes('toxic') || normalized.includes('kasar')) {
      return 'Ciri komentar toxic: menyerang pribadi, merendahkan, atau memancing konflik. Ganti dengan kritik yang spesifik dan netral.';
    }

    if (normalized.includes('ai') || normalized.includes('literasi')) {
      return 'Gunakan AI secara etis: jangan bagikan data sensitif, cek ulang fakta, dan tulis ulang dengan pemahaman sendiri.';
    }

    return 'Saya sarankan gunakan pola: apresiasi singkat, sebutkan bagian yang perlu perbaikan, lalu beri saran yang dapat dilakukan.';
  };

  const submitForumMessage = () => {
    if (!forumDraft.trim()) return;

    const moderationResult = moderateAndRewrite(forumDraft);
    const baseMessages: ForumMessage[] = [];
    const studentName = currentUser?.name ?? 'Siswa';

    if (moderationResult.blocked) {
      baseMessages.push(
        {
          id: Date.now(),
          author: studentName,
          role: 'student',
          text: 'Pesan ditahan oleh moderator otomatis karena mengandung bahasa kasar.',
          time: getTimeLabel(),
          status: 'blocked',
        },
        {
          id: Date.now() + 1,
          author: 'Moderator AI',
          role: 'moderator',
          text: moderationResult.suggestion,
          time: getTimeLabel(),
          status: 'normal',
        },
      );
    } else {
      baseMessages.push({
        id: Date.now(),
        author: studentName,
        role: 'student',
        text: forumDraft,
        time: getTimeLabel(),
        status: 'normal',
      });
    }

    setForumMessages((previous) => [...previous, ...baseMessages]);
    setForumDraft('');
  };

  const askChatbot = () => {
    if (!chatbotDraft.trim()) return;
    const answer = getChatbotAnswer(chatbotDraft);
    setChatbotReply(answer);
    setForumMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        author: 'Chat Bot',
        role: 'chatbot',
        text: answer,
        time: getTimeLabel(),
        status: 'normal',
      },
    ]);
    setChatbotDraft('');
  };

  const updateStudentRole = (id: number, role: AdminRole) => {
    setStudentAccounts((previous) => previous.map((student) => (
      student.id === id ? { ...student, role } : student
    )));
  };

  const toggleStudentAccount = (id: number) => {
    setStudentAccounts((previous) => previous.map((student) => (
      student.id === id ? { ...student, active: !student.active } : student
    )));
  };

  const addForbiddenWord = () => {
    const nextWord = forbiddenWordInput.trim().toLowerCase();
    if (!nextWord || forbiddenWords.includes(nextWord)) return;
    setForbiddenWords((previous) => [nextWord, ...previous]);
    setForbiddenWordInput('');
  };

  const saveEthicsRubric = () => {
    setRubricNotice(`Rubrik etika diperbarui pada ${new Date().toLocaleString('id-ID')}.`);
  };

  const uploadModule = () => {
    if (!moduleUploadInput.trim()) return;
    setUploadedModules((previous) => [moduleUploadInput.trim(), ...previous]);
    setModuleUploadInput('');
  };

  const addAdminTask = () => {
    if (!adminTaskInput.trim()) return;
    setAdminTasks((previous) => [adminTaskInput.trim(), ...previous]);
    setAdminTaskInput('');
  };

  const completedModules = learningModules.filter((module) => learningModuleProgress[module.id]?.status === 'selesai').length;
  const inProgressModules = learningModules.filter((module) => learningModuleProgress[module.id]?.status === 'sedang-dipelajari').length;
  const bookmarkedModules = learningModules.filter((module) => learningModuleProgress[module.id]?.bookmarked).length;
  const moduleCompletionPercent = Math.round((completedModules / learningModules.length) * 100);
  const blockedForumMessages = forumMessages.filter((message) => message.status === 'blocked').length;
  const totalAnalyses = analysisLogs.length;
  const averageEthicsScore = totalAnalyses > 0
    ? Math.round(analysisLogs.reduce((sum, log) => sum + log.finalScore, 0) / totalAnalyses)
    : 0;
  const trendLogs = analysisLogs.slice(0, 7).reverse();
  const lineChartPoints = trendLogs.map((log, index) => {
    const x = trendLogs.length === 1 ? 50 : (index / (trendLogs.length - 1)) * 100;
    const y = 100 - log.finalScore;
    return `${x},${y}`;
  }).join(' ');
  const ethicLevel = averageEthicsScore >= 85
    ? 'Level 5 - Teladan Etika'
    : averageEthicsScore >= 70
      ? 'Level 4 - Komunikator Positif'
      : averageEthicsScore >= 55
        ? 'Level 3 - Berkembang'
        : averageEthicsScore >= 40
          ? 'Level 2 - Dasar Etika'
          : 'Level 1 - Perlu Pendampingan';
  const achievementList = [
    { label: 'Analisis Pertama', unlocked: totalAnalyses >= 1 },
    { label: 'Konsisten 10 Analisis', unlocked: totalAnalyses >= 10 },
    { label: 'Rata-rata Etika > 75', unlocked: averageEthicsScore > 75 },
    { label: 'Selesaikan 3 Materi', unlocked: completedModules >= 3 },
  ];
  const radarMetrics = [
    { label: 'Empati', value: Math.max(0, Math.min(100, averageEthicsScore + 6)) },
    { label: 'Kesopanan', value: Math.max(0, Math.min(100, averageEthicsScore + 2)) },
    { label: 'Kejelasan', value: Math.max(0, Math.min(100, averageEthicsScore - 4)) },
    { label: 'Kolaborasi', value: Math.max(0, Math.min(100, averageEthicsScore - 2)) },
    { label: 'Literasi AI', value: Math.max(0, Math.min(100, averageEthicsScore + (completedModules * 3))) },
  ];
  const radarPoints = radarMetrics.map((metric, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) * index / radarMetrics.length);
    const radius = (metric.value / 100) * 45;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  const totalMeetings = 16;
  const attendancePercentage = Math.min(100, Math.round((attendanceHistory.length / totalMeetings) * 100));
  const attendanceQrCode = `ETIKA-${(qrDayKey || '0000-00-00').replace(/-/g, '')}`;
  const toxicityAverage = totalAnalyses > 0 ? Math.round(analysisLogs.reduce((sum, item) => sum + (100 - item.finalScore), 0) / totalAnalyses) : 0;
  const highToxicityCount = analysisLogs.filter((item) => (100 - item.finalScore) >= 70).length;
  const mediumToxicityCount = analysisLogs.filter((item) => (100 - item.finalScore) >= 40 && (100 - item.finalScore) < 70).length;
  const minimumTestResults = minimumTestCases.map((testCase) => {
    const result = evaluateCommentRisk(testCase.text);
    return {
      ...testCase,
      actualScore: result.toxicityScore,
      consistent: result.toxicityScore === testCase.expectedScore,
      explainable: result.triggers.length > 0,
      hasRephrase: result.improvedComment.trim().length > 0,
    };
  });

  const submitAttendanceByQr = () => {
    if (!attendanceFeatureActive) {
      setAttendanceNotice('Presensi nonaktif. Aktifkan fitur presensi terlebih dahulu.');
      return;
    }
    if (!attendanceEthicsChecked) {
      setAttendanceNotice('Presensi etika belum disetujui. Centang komitmen etika sebelum absen.');
      return;
    }
    if (qrCodeInput.trim().toUpperCase() !== attendanceQrCode) {
      setAttendanceNotice('Kode QR tidak valid. Cek kembali kode presensi hari ini.');
      return;
    }
    if (!currentUser) {
      setAttendanceNotice('Sesi pengguna tidak ditemukan. Silakan login ulang.');
      return;
    }

    markAttendance(currentUser);
    setAttendanceHistory(getAttendanceByUser(currentUser.email));
    setTodayAttendance(getTodayAttendance());
    setIsPresentToday(hasCheckedInToday(currentUser.email));
    setAttendanceNotice('Presensi berhasil melalui QR dan etika. Kehadiran Anda tercatat.');
    setQrCodeInput('');
  };

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,105,180,0.24),transparent_55%)]" />

      <div className="mx-auto w-full max-w-[96rem] px-6 py-6 sm:px-10 lg:px-12">
        <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
          <aside className="mb-8 lg:mb-0">
            <div className="flex flex-col overflow-hidden rounded-[2rem] border border-rose-950/60 bg-[#15111a] text-white shadow-[0_24px_80px_rgba(78,18,49,0.35)] lg:sticky lg:top-6">
              <div className="border-b border-white/8 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-400 to-orange-200 text-lg font-bold text-white shadow-lg shadow-pink-500/25">
                    E
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">Etika Digital AI</p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[42rem] flex-col px-4 py-5">
                <nav className="flex flex-col gap-2 text-sm font-medium">
                  {sectionConfig.map((section) => {
                    const isActive = activeSection === section.id;

                    return (
                      <Link
                        key={section.id}
                        href={section.href}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(236,72,153,0.28)]'
                            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-bold tracking-[0.12em] ${
                          isActive ? 'bg-white/18 text-white' : 'bg-white/6 text-pink-200/80'
                        }`}>
                          {menuIcons[section.id]}
                        </span>
                        <span>{section.label}</span>
                      </Link>
                    );
                  })}

                  <div className="mt-5">
                    <div className="mt-2 flex flex-col gap-2">
                      {bottomSectionConfig.map((section) => {
                        const isActive = activeSection === section.id;

                        return (
                          <Link
                            key={section.id}
                            href={section.href}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                              isActive
                                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(236,72,153,0.28)]'
                                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-bold tracking-[0.12em] ${
                              isActive ? 'bg-white/18 text-white' : 'bg-white/6 text-pink-200/80'
                            }`}>
                              {menuIcons[section.id]}
                            </span>
                            <span>{section.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </nav>

                <div className="mt-auto border-t border-white/8 px-2 pt-5">
                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Mode Gelap</p>
                      <p className="text-[11px] text-zinc-400">Pink dashboard</p>
                    </div>
                    <div className="flex h-7 w-12 items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1">
                      <div className="ml-auto h-5 w-5 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-rose-700">
                      {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{currentUser?.name ?? 'admin'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center rounded-2xl bg-rose-950/90 px-5 py-3 text-sm font-semibold text-pink-50 transition hover:bg-rose-900"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <section className="w-full pb-16 pt-2">
              <div className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,240,245,0.96),rgba(255,228,236,0.92))] p-5 text-rose-950 shadow-[0_30px_100px_rgba(203,72,139,0.18)] backdrop-blur sm:p-7">
                <div className="flex flex-col gap-4 border-b border-rose-200/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-rose-950 sm:text-4xl">
                      {getPageTitle(activeSection)}
                    </h1>
                  </div>
                  {activeSection === 'overview' && (
                    <div className="flex flex-wrap gap-3">
                      {currentUser && (
                        <span className="rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm text-rose-800">
                          Login sebagai {currentUser.name}
                        </span>
                      )}
                      <button
                        onClick={analyzeComment}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-300 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(239,68,145,0.3)] transition hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        {loading ? 'AI sedang menilai...' : 'Nilai komentar dengan AI'}
                      </button>
                    </div>
                  )}
                </div>

                {activeSection === 'overview' && (
                  <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-[0_16px_40px_rgba(203,72,139,0.08)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="mt-3 text-2xl font-semibold text-rose-950">Analisis komentar utama</h2>
                          </div>
                          <span className="rounded-full bg-pink-100 px-3 py-2 text-xs font-semibold text-rose-700">
                            {analysis ? analysis.category : 'Ready'}
                          </span>
                        </div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tulis komentar yang ingin dianalisis AI di sini..."
                          className="mt-5 min-h-44 w-full rounded-2xl border border-rose-200 bg-pink-50/40 p-4 text-rose-950 placeholder-rose-400 focus:border-rose-500 focus:outline-none"
                          rows={7}
                        />
                        <p className="mt-4 text-sm leading-7 text-rose-900/65">
                          {analysis
                            ? analysis.explanation
                            : 'Panel ini menampilkan komentar, status analisis, dan ringkasan kenapa komentar perlu diperhalus.'}
                        </p>
                      </div>

                      <div className="rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-rose-950 via-rose-900 to-[#2b1321] p-5 text-white shadow-[0_20px_55px_rgba(120,28,73,0.28)]">
                        <h2 className="mt-3 text-2xl font-semibold">Area aman untuk simulasi komentar</h2>
                        <p className="mt-4 text-sm leading-7 text-pink-50/85">
                          {analysis
                            ? `AI mendeteksi ${analysis.triggers.length} indikator utama dan menjaga saran perbaikan tetap fokus pada etika komunikasi.`
                            : 'Gunakan panel ini untuk mencoba komentar baru tanpa mengubah materi belajar atau data kelas Anda.'}
                        </p>
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          {(analysis?.triggers ?? ['Bahasa aman', 'Deteksi konteks', 'Revisi etis']).map((trigger) => (
                            <div key={trigger} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-pink-50/90 backdrop-blur">
                              {trigger}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.75rem] bg-gradient-to-br from-pink-500 via-rose-500 to-orange-300 p-5 text-white shadow-[0_20px_55px_rgba(239,68,145,0.28)]">
                        <p className="mt-4 text-5xl font-bold">{analysis ? `${analysis.toxicityScore.toFixed(0)}%` : '--'}</p>
                        <p className="mt-3 text-sm text-pink-50/90">{analysis ? analysis.riskLevel : 'Belum ada hasil penilaian'}</p>
                        <div className="mt-5 rounded-2xl bg-white/12 px-4 py-4 backdrop-blur">
                          <p className="mt-2 text-xl font-semibold">{analysis ? analysis.category : 'Menunggu analisis'}</p>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-[0_16px_40px_rgba(203,72,139,0.08)]">
                        <h2 className="mt-3 text-2xl font-semibold text-rose-950">Saran rephrase yang lebih etis</h2>
                        <div className="mt-5 rounded-[1.5rem] bg-pink-50/80 p-4 text-sm leading-7 text-rose-900">
                          {analysis
                            ? analysis.improvedComment
                            : 'Versi komentar yang lebih sopan dan konstruktif akan muncul di sini setelah AI dijalankan.'}
                        </div>
                        <div className="mt-5 space-y-3">
                          {(analysis?.suggestions ?? [
                            'Fokus pada isi komentar, bukan menyerang orang.',
                            'Gunakan nada netral agar pesan lebih mudah diterima.',
                            'Tambahkan konteks atau solusi saat memberi kritik.',
                          ]).map((suggestion) => (
                            <div key={suggestion} className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm leading-6 text-rose-800">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'score' && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-gradient-to-b from-white to-pink-50/80 p-5">
                      <h2 className="mt-3 text-2xl font-semibold text-rose-950">Masukkan komentar untuk dianalisis</h2>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Contoh: Kamu memang nggak becus, hasil kerja kamu bikin kesel."
                        className="mt-5 min-h-52 w-full rounded-2xl border border-rose-200 bg-white p-4 text-rose-950 placeholder-rose-400 focus:border-rose-500 focus:outline-none"
                        rows={8}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                        <p className="text-sm text-pink-50/80">Skor toksisitas</p>
                        <p className="mt-2 text-5xl font-bold">{analysis ? `${analysis.toxicityScore.toFixed(0)}%` : '--'}</p>
                        <p className="mt-3 text-sm text-pink-50/90">{analysis ? analysis.riskLevel : 'AI belum memberi penilaian'}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <p className="text-sm font-semibold text-rose-700">Kategori hasil</p>
                        <p className="mt-3 text-2xl font-semibold text-rose-950">
                          {analysis ? analysis.category : 'Belum ada kategori'}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-rose-900/65">
                          Halaman ini khusus menampilkan skor toksisitas, tingkat risiko, dan kategori hasil analisis komentar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'improvements' && (
                  <div className="mt-6 rounded-[1.5rem] border border-rose-100 bg-white p-5">
                    <h2 className="mt-3 text-2xl font-semibold text-rose-950">Versi komentar yang lebih aman dan tetap tegas</h2>
                    <div className="mt-5 rounded-[1.5rem] border border-rose-100 bg-pink-50/70 p-5">
                      <p className="text-sm leading-8 text-rose-900">
                        {analysis ? analysis.improvedComment : 'Versi komentar yang lebih sopan dan konstruktif akan muncul di sini setelah AI selesai menilai.'}
                      </p>
                    </div>
                    <div className="mt-5 space-y-3">
                      {analysis ? analysis.suggestions.map((suggestion) => (
                        <div key={suggestion} className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm leading-6 text-rose-800">
                          {suggestion}
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-6 text-sm leading-6 text-rose-900/60">
                          AI akan memberikan beberapa alternatif perbaikan setelah analisis selesai.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'triggers' && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="mt-3 text-2xl font-semibold text-rose-950">Pemicu yang dibaca AI</h2>
                        </div>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700">
                          AI Detection
                        </span>
                      </div>
                      <div className="mt-5 space-y-3">
                        {analysis ? analysis.triggers.map((trigger) => (
                          <div key={trigger} className="rounded-2xl border border-rose-100 bg-pink-50/70 px-4 py-4 text-sm text-rose-900">
                            {trigger}
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-6 text-sm leading-6 text-rose-900/60">
                            Setelah komentar dianalisis, halaman ini akan menampilkan faktor yang membuat pesan berisiko.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-rose-100 bg-pink-50/80 p-5">
                      <div className="mt-4 flex flex-wrap gap-2">
                        {programs.map((program) => (
                          <span key={program} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-rose-800">
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'learning' && (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-rose-100 bg-white p-4">
                        <p className="mt-3 text-3xl font-semibold text-rose-950">{completedModules}</p>
                        <p className="mt-2 text-sm text-rose-900/65">{moduleCompletionPercent}% modul tuntas</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-rose-100 bg-white p-4">
                        <p className="mt-3 text-3xl font-semibold text-rose-950">{inProgressModules}</p>
                        <p className="mt-2 text-sm text-rose-900/65">Modul aktif saat ini</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-rose-100 bg-white p-4">
                        <p className="mt-3 text-3xl font-semibold text-rose-950">{bookmarkedModules}</p>
                        <p className="mt-2 text-sm text-rose-900/65">Modul disimpan untuk dibaca ulang</p>
                      </div>
                    </div>

                    {learningModules.map((module) => (
                      <section key={module.id} className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <button
                          type="button"
                          onClick={() => setOpenedModuleId((previous) => (previous === module.id ? null : module.id))}
                          className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl text-left"
                        >
                          <div>
                            <h2 className="mt-2 text-2xl font-semibold text-rose-950">{module.title}</h2>
                            <p className="mt-2 text-sm text-rose-900/65">
                              {openedModuleId === module.id ? 'Klik lagi untuk menutup modul' : 'Klik untuk membuka isi modul'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                              {moduleStatusLabel[learningModuleProgress[module.id]?.status ?? 'belum-dipelajari']}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {openedModuleId === module.id ? 'Tutup' : 'Buka'}
                            </span>
                          </div>
                        </button>

                        {openedModuleId === module.id && (
                          <>
                            <p className="mt-4 text-sm leading-7 text-rose-900/70">{module.summary}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateModuleStatus(module.id, 'sedang-dipelajari')}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  learningModuleProgress[module.id]?.status === 'sedang-dipelajari'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                }`}
                              >
                                Sedang dipelajari
                              </button>
                              <button
                                type="button"
                                onClick={() => updateModuleStatus(module.id, 'selesai')}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  learningModuleProgress[module.id]?.status === 'selesai'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                Selesai
                              </button>
                              <button
                                type="button"
                                onClick={() => updateModuleStatus(module.id, 'belum-dipelajari')}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  learningModuleProgress[module.id]?.status === 'belum-dipelajari'
                                    ? 'bg-slate-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Reset
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleModuleBookmark(module.id)}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  learningModuleProgress[module.id]?.bookmarked
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {learningModuleProgress[module.id]?.bookmarked ? 'Bookmarked' : 'Bookmark'}
                              </button>
                            </div>

                            <div className="mt-5 rounded-2xl bg-pink-50/80 p-4">
                              <p className="text-sm font-semibold text-rose-900">Aturan etika</p>
                              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-800">
                                {module.ethicsRules.map((rule) => (
                                  <li key={rule}>{rule}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4">
                              <p className="text-sm font-semibold text-rose-900">Studi kasus</p>
                              <p className="mt-2 text-sm leading-6 text-rose-900/75">{module.caseStudy.context}</p>
                              <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl bg-rose-50 px-4 py-3">
                                  <p className="mt-2 text-sm leading-6 text-rose-900">{module.caseStudy.unethicalComment}</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                                  <p className="mt-2 text-sm leading-6 text-emerald-900">{module.caseStudy.improvedComment}</p>
                                </div>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-rose-900/75">{module.caseStudy.fixReason}</p>
                            </div>
                          </>
                        )}
                      </section>
                    ))}
                  </div>
                )}

                {activeSection === 'classroom' && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <h2 className="mt-3 text-2xl font-semibold text-rose-950">Pusat kelas, latihan, leaderboard, dan forum AI</h2>
                      <p className="mt-3 text-sm leading-7 text-rose-900/65">
                        Pilih menu kelas untuk melihat kelas yang diikuti, jalur fundamental hingga praktik, tugas analisis, ranking, dan forum diskusi dengan moderator otomatis.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {classroomTabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setClassroomActiveTab(tab.id)}
                            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              classroomActiveTab === tab.id
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {classroomActiveTab === 'diikuti' && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {joinedClassList.map((item) => (
                          <div key={item.title} className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-lg font-semibold text-rose-950">{item.title}</h3>
                              <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-semibold text-rose-700">{item.badge}</span>
                            </div>
                            <p className="mt-3 text-sm text-rose-900/70">Mentor: {item.mentor}</p>
                            <p className="mt-4 text-sm font-semibold text-rose-700">Progres {item.progress}%</p>
                            <div className="mt-2 h-2 rounded-full bg-rose-100">
                              <div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {classroomActiveTab === 'fundamental' && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {fundamentalClassList.map((item) => (
                          <div key={item.title} className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                            <h3 className="text-lg font-semibold text-rose-950">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-rose-900/70">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {classroomActiveTab === 'spesialis' && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {specialistClassList.map((item) => (
                          <div key={item.title} className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                            <h3 className="text-lg font-semibold text-rose-950">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-rose-900/70">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {classroomActiveTab === 'praktik' && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {practiceClassList.map((item) => {
                          const percent = Math.round((item.done / Math.max(item.targetCount, 1)) * 100);
                          return (
                            <div key={item.title} className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                              <h3 className="text-lg font-semibold text-rose-950">{item.title}</h3>
                              <p className="mt-3 text-sm text-rose-900/70">Target: {item.target}</p>
                              <p className="mt-2 text-sm text-rose-900/70">Selesai: {item.done}</p>
                              <div className="mt-3 h-2 rounded-full bg-rose-100">
                                <div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${Math.min(percent, 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {classroomActiveTab === 'tugas' && (
                      <div className="grid gap-4 xl:grid-cols-[0.64fr_0.36fr]">
                        <div className="overflow-hidden rounded-[1.5rem] border border-rose-100 bg-white">
                          <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr] gap-3 border-b border-rose-100 px-4 py-3 text-xs font-semibold text-rose-500">
                            <span>Tugas & latihan</span>
                            <span>Tanggal</span>
                            <span>Status</span>
                          </div>
                          <div className="divide-y divide-rose-100">
                            {exerciseLog.length > 0 ? exerciseLog.map((exercise) => (
                              <div key={exercise.id} className="grid grid-cols-[1.3fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm">
                                <span className="text-rose-900">{exercise.name}</span>
                                <span className="text-rose-700/70">{exercise.date}</span>
                                <span className="text-emerald-700">{exercise.completed ? 'Selesai' : 'Proses'}</span>
                              </div>
                            )) : (
                              <div className="px-4 py-6 text-sm text-rose-900/60">
                                Belum ada tugas atau latihan yang ditambahkan.
                              </div>
                            )}
                          </div>
                        </div>

                        <aside className="rounded-[1.5rem] border border-pink-300/50 bg-gradient-to-b from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                          <h3 className="mt-3 text-xl font-semibold">Catat latihan analisis</h3>
                          <input
                            type="text"
                            value={newExercise}
                            onChange={(e) => setNewExercise(e.target.value)}
                            placeholder="Contoh: analisis ulang komentar toxic"
                            className="mt-5 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-pink-100/60 focus:border-white focus:outline-none"
                          />
                          <button
                            onClick={addExercise}
                            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Tambah ke tugas kelas
                          </button>
                        </aside>
                      </div>
                    )}

                    {classroomActiveTab === 'leaderboard' && (
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <div className="mt-4 space-y-3">
                          {leaderboardData.map((item) => (
                            <div key={item.rank} className="flex items-center justify-between rounded-2xl bg-pink-50/70 px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-rose-700">{item.rank}</span>
                                <span className="font-medium text-rose-900">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-rose-900">{item.score} poin</p>
                                <p className="text-xs text-rose-700/70">Streak {item.streak}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {classroomActiveTab === 'forum' && (
                      <div className="grid gap-4 xl:grid-cols-[0.66fr_0.34fr]">
                        <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="mt-2 text-xl font-semibold text-rose-950">Moderator otomatis aktif</h3>
                            </div>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                              Pesan ditahan: {blockedForumMessages}
                            </span>
                          </div>

                          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {forumMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`rounded-2xl px-4 py-3 text-sm ${
                                  message.status === 'blocked'
                                    ? 'border border-rose-200 bg-rose-50'
                                    : message.role === 'moderator'
                                      ? 'bg-amber-50'
                                      : message.role === 'chatbot'
                                        ? 'bg-sky-50'
                                        : 'bg-pink-50/70'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-rose-900">{message.author}</p>
                                  <p className="text-xs text-rose-700/70">{message.time}</p>
                                </div>
                                <p className="mt-2 leading-6 text-rose-900/85">{message.text}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <input
                              type="text"
                              value={forumDraft}
                              onChange={(e) => setForumDraft(e.target.value)}
                              placeholder="Kirim chat forum kelas..."
                              className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-950 placeholder:text-rose-400 focus:border-rose-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={submitForumMessage}
                              className="shrink-0 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                              Kirim
                            </button>
                          </div>
                        </div>

                        <aside className="rounded-[1.5rem] border border-pink-300/50 bg-gradient-to-b from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                          <h3 className="mt-3 text-xl font-semibold">Asisten etika komentar</h3>
                          <p className="mt-3 text-sm leading-6 text-pink-50/90">
                            Tanya contoh komentar yang lebih etis, cara menghindari toxic, atau cara cek informasi dari AI.
                          </p>
                          <input
                            type="text"
                            value={chatbotDraft}
                            onChange={(e) => setChatbotDraft(e.target.value)}
                            placeholder="Contoh: beri contoh komentar yang sopan"
                            className="mt-5 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-pink-100/60 focus:border-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={askChatbot}
                            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Tanya Chat Bot
                          </button>
                          <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm leading-6 text-pink-50">
                            {chatbotReply || 'Jawaban chat bot akan muncul di sini dan juga masuk ke forum.'}
                          </div>
                        </aside>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'attendance' && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <h2 className="mt-3 text-2xl font-semibold text-rose-950">Monitor kehadiran dan presensi etika</h2>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{attendancePercentage}%</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{totalMeetings}</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-xl font-semibold text-rose-950">{isPresentToday ? 'Hadir Hari Ini' : 'Belum Hadir'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[0.62fr_0.38fr]">
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="mt-2 text-xl font-semibold text-rose-950">Kontrol presensi kelas</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttendanceFeatureActive((previous) => !previous)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              attendanceFeatureActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {attendanceFeatureActive ? 'Presensi Aktif' : 'Presensi Nonaktif'}
                          </button>
                        </div>

                        <div className="mt-5 rounded-2xl bg-pink-50/70 p-4">
                          <p className="text-sm font-semibold text-rose-900">Presensi Berbasis Kode QR</p>
                          <div className="mt-3 grid gap-4 md:grid-cols-[0.38fr_0.62fr]">
                            <div className="rounded-xl border border-rose-200 bg-white p-3">
                              <div className="grid grid-cols-6 gap-1">
                                {Array.from({ length: 36 }).map((_, index) => (
                                  <span
                                    key={index}
                                    className={`h-3 w-3 rounded-sm ${index % 3 === 0 || index % 5 === 0 ? 'bg-rose-700' : 'bg-rose-100'}`}
                                  />
                                ))}
                              </div>
                              <p className="mt-3 text-center text-[11px] font-semibold tracking-[0.14em] text-rose-700">
                                {attendanceQrCode}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-rose-900/75">Masukkan kode QR harian untuk menyelesaikan presensi.</p>
                              <input
                                type="text"
                                value={qrCodeInput}
                                onChange={(e) => setQrCodeInput(e.target.value)}
                                placeholder="Contoh: ETIKA-20260422"
                                className="mt-3 w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-950 placeholder:text-rose-400 focus:border-rose-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={submitAttendanceByQr}
                                className="mt-3 inline-flex rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                              >
                                Validasi Presensi QR
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <aside className="rounded-[1.5rem] border border-pink-300/50 bg-gradient-to-b from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                        <h3 className="mt-3 text-xl font-semibold">Komitmen sebelum absen</h3>
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-pink-50/90">
                          <li>Saya berkomunikasi sopan di forum kelas.</li>
                          <li>Saya tidak mengirim komentar kasar atau merendahkan.</li>
                          <li>Saya menjaga privasi dan etika digital saat belajar.</li>
                        </ul>
                        <label className="mt-4 flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={attendanceEthicsChecked}
                            onChange={(e) => setAttendanceEthicsChecked(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-white/40"
                          />
                          <span>Saya menyetujui komitmen presensi etika.</span>
                        </label>
                        <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm leading-6">
                          {attendanceNotice || 'Notifikasi validasi presensi akan muncul di sini.'}
                        </div>
                      </aside>
                    </div>

                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <div className="mt-4 space-y-2">
                        {todayAttendance.length > 0 ? todayAttendance.slice(0, 6).map((record) => (
                          <div key={record.id} className="flex items-center justify-between gap-3 rounded-2xl bg-pink-50/70 px-4 py-3 text-sm">
                            <span className="truncate text-rose-900">{record.userName}</span>
                            <span className="shrink-0 text-rose-700/70">
                              {new Date(record.joinedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-rose-200 px-4 py-5 text-sm text-rose-900/60">
                            Belum ada peserta yang melakukan presensi hari ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'progress' && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <h2 className="mt-3 text-2xl font-semibold text-rose-950">Statistik etika pembelajaran</h2>
                      <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{totalAnalyses}</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{averageEthicsScore}</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{completedModules}/{learningModules.length}</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50/80 px-4 py-4">
                          <p className="mt-2 text-3xl font-semibold text-rose-950">{progress}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <h3 className="mt-2 text-lg font-semibold text-rose-950">Grafik Garis (Skor Etika)</h3>
                        <div className="mt-4 rounded-2xl bg-pink-50/70 p-4">
                          {trendLogs.length > 0 ? (
                            <svg viewBox="0 0 100 100" className="h-52 w-full">
                              <polyline points="0,100 100,100" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
                              <polyline points="0,75 100,75" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
                              <polyline points="0,50 100,50" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
                              <polyline points="0,25 100,25" fill="none" stroke="#fbcfe8" strokeWidth="0.7" />
                              <polyline points={lineChartPoints} fill="none" stroke="#e11d48" strokeWidth="2.4" />
                            </svg>
                          ) : (
                            <p className="py-12 text-center text-sm text-rose-900/60">Belum ada data tren. Jalankan analisis komentar untuk menampilkan grafik.</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <h3 className="mt-2 text-lg font-semibold text-rose-950">Profil Etika Pengguna</h3>
                        <div className="mt-4 rounded-2xl bg-pink-50/70 p-4">
                          <svg viewBox="0 0 100 100" className="mx-auto h-52 w-52">
                            <polygon points="50,5 92,35 76,85 24,85 8,35" fill="none" stroke="#f9a8d4" strokeWidth="1" />
                            <polygon points="50,20 80,42 69,77 31,77 20,42" fill="none" stroke="#fbcfe8" strokeWidth="1" />
                            <polygon points={radarPoints} fill="rgba(225,29,72,0.2)" stroke="#e11d48" strokeWidth="1.8" />
                          </svg>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-rose-800">
                            {radarMetrics.map((metric) => (
                              <p key={metric.label} className="rounded-lg bg-white px-2 py-2">
                                {metric.label}: {Math.round(metric.value)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100">
                        <div className="grid grid-cols-[0.9fr_2fr_0.8fr_0.8fr] gap-3 border-b border-rose-100 bg-pink-50/70 px-4 py-3 text-xs font-semibold text-rose-500">
                          <span>Waktu</span>
                          <span>Kalimat Input</span>
                          <span>Skor Akhir</span>
                          <span>Status</span>
                        </div>
                        <div className="divide-y divide-rose-100">
                          {analysisLogs.length > 0 ? analysisLogs.map((log) => (
                            <div key={log.id} className="grid grid-cols-[0.9fr_2fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm">
                              <span className="text-rose-700/80">{log.time}</span>
                              <span className="text-rose-900">{log.input}</span>
                              <span className="font-semibold text-rose-900">{log.finalScore}</span>
                              <span className={`${log.status === 'Etis' ? 'text-emerald-700' : log.status === 'Perlu perbaikan' ? 'text-amber-700' : 'text-rose-700'}`}>
                                {log.status}
                              </span>
                            </div>
                          )) : (
                            <div className="px-4 py-6 text-sm text-rose-900/60">
                              Belum ada log analisis. Tulis komentar lalu klik &quot;Nilai komentar dengan AI&quot;.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <div className="mt-4 space-y-2">
                          {achievementList.map((achievement) => (
                            <div key={achievement.label} className={`rounded-xl px-4 py-3 text-sm ${
                              achievement.unlocked ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {achievement.unlocked ? 'Tercapai' : 'Belum'} - {achievement.label}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-pink-300/50 bg-gradient-to-b from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                        <h3 className="mt-3 text-2xl font-semibold">{ethicLevel}</h3>
                        <p className="mt-3 text-sm leading-6 text-pink-50/90">
                          Skor rata-rata etika Anda saat ini {averageEthicsScore}. Jaga konsistensi komentar yang netral, empatik, dan berbasis solusi untuk naik level.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'admin' && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <h2 className="text-2xl font-semibold text-rose-950">Fitur Utama Admin</h2>
                      <p className="mt-2 text-sm text-rose-900/70">
                        Manajemen pengguna, data set & aturan AI, monitoring aktivitas, dan manajemen konten e-learning.
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <h3 className="text-xl font-semibold text-rose-950">Manajemen Pengguna</h3>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100">
                        <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr] gap-3 border-b border-rose-100 bg-pink-50/70 px-4 py-3 text-xs font-semibold text-rose-500">
                          <span>Daftar Mahasiswa</span>
                          <span>NIM</span>
                          <span>Role Access</span>
                          <span>Kontrol Akun</span>
                        </div>
                        <div className="divide-y divide-rose-100">
                          {studentAccounts.map((student) => (
                            <div key={student.id} className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm">
                              <span className="text-rose-900">{student.name}</span>
                              <span className="text-rose-700/80">{student.nim}</span>
                              <select
                                value={student.role}
                                onChange={(e) => updateStudentRole(student.id, e.target.value as AdminRole)}
                                className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs text-rose-800 focus:border-rose-500 focus:outline-none"
                              >
                                <option value="mahasiswa">Mahasiswa</option>
                                <option value="mentor">Mentor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => toggleStudentAccount(student.id)}
                                className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                                  student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {student.active ? 'Aktif' : 'Dinonaktifkan'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <h3 className="text-xl font-semibold text-rose-950">Manajemen Data Set & Aturan AI</h3>
                        <div className="mt-4 rounded-2xl bg-pink-50/70 p-4">
                          <p className="text-sm font-semibold text-rose-900">Tambah Kata Terlarang</p>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={forbiddenWordInput}
                              onChange={(e) => setForbiddenWordInput(e.target.value)}
                              placeholder="Tambahkan kata..."
                              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-950 placeholder:text-rose-400 focus:border-rose-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={addForbiddenWord}
                              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                            >
                              Tambah
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {forbiddenWords.map((word) => (
                              <span key={word} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-rose-100 p-4">
                          <p className="text-sm font-semibold text-rose-900">Review Rephrase</p>
                          <div className="mt-2 space-y-2">
                            {(analysisLogs.slice(0, 3)).map((log) => (
                              <div key={log.id} className="rounded-xl bg-pink-50/70 px-3 py-2 text-sm text-rose-900">
                                Input: {log.input}
                                <br />
                                Status: {log.status}
                              </div>
                            ))}
                            {analysisLogs.length === 0 && (
                              <div className="rounded-xl border border-dashed border-rose-200 px-3 py-3 text-sm text-rose-900/60">
                                Belum ada data rephrase untuk direview.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-rose-100 p-4">
                          <p className="text-sm font-semibold text-rose-900">Update Rubrik Etika</p>
                          <textarea
                            value={ethicsRubric}
                            onChange={(e) => setEthicsRubric(e.target.value)}
                            className="mt-2 min-h-24 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-950 focus:border-rose-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={saveEthicsRubric}
                            className="mt-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            Simpan Rubrik
                          </button>
                          {rubricNotice && <p className="mt-2 text-xs text-rose-700">{rubricNotice}</p>}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                        <h3 className="text-xl font-semibold text-rose-950">Monitoring Aktivitas</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl bg-pink-50/80 px-3 py-3">
                            <p className="text-2xl font-semibold text-rose-950">{totalAnalyses}</p>
                            <p className="text-xs text-rose-700/70">Log Analisis Global</p>
                          </div>
                          <div className="rounded-2xl bg-pink-50/80 px-3 py-3">
                            <p className="text-2xl font-semibold text-rose-950">{toxicityAverage}%</p>
                            <p className="text-xs text-rose-700/70">Statistik Toksisitas</p>
                          </div>
                          <div className="rounded-2xl bg-pink-50/80 px-3 py-3">
                            <p className="text-2xl font-semibold text-rose-950">{initialCustomerReports.length}</p>
                            <p className="text-xs text-rose-700/70">Laporan Pelanggan</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-900">
                          Toxicity tinggi: {highToxicityCount} | Toxicity sedang: {mediumToxicityCount}
                        </div>
                        <div className="mt-4 space-y-2">
                          {initialCustomerReports.map((report) => (
                            <div key={report.id} className="rounded-xl border border-rose-100 bg-white px-3 py-3 text-sm">
                              <p className="font-semibold text-rose-900">{report.reporter}</p>
                              <p className="text-rose-900/75">{report.issue}</p>
                              <p className="text-xs text-rose-700/70">Status: {report.status}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-pink-300/50 bg-gradient-to-b from-pink-500 via-rose-500 to-orange-300 p-5 text-white">
                      <h3 className="text-xl font-semibold">Manajemen Konten E-Learning</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white/12 p-4">
                          <p className="text-sm font-semibold text-pink-50">Upload Modul</p>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={moduleUploadInput}
                              onChange={(e) => setModuleUploadInput(e.target.value)}
                              placeholder="Nama file modul..."
                              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-pink-100/60 focus:border-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={uploadModule}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Upload
                            </button>
                          </div>
                          <div className="mt-3 space-y-2">
                            {uploadedModules.map((module) => (
                              <div key={module} className="rounded-lg bg-white/15 px-3 py-2 text-sm text-pink-50">
                                {module}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/12 p-4">
                          <p className="text-sm font-semibold text-pink-50">Kelola Tugas</p>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={adminTaskInput}
                              onChange={(e) => setAdminTaskInput(e.target.value)}
                              placeholder="Tambah tugas baru..."
                              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-pink-100/60 focus:border-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={addAdminTask}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              Tambah
                            </button>
                          </div>
                          <div className="mt-3 space-y-2">
                            {adminTasks.map((task) => (
                              <div key={task} className="rounded-lg bg-white/15 px-3 py-2 text-sm text-pink-50">
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5">
                      <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100">
                        <div className="grid grid-cols-[0.45fr_2fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-rose-100 bg-pink-50/70 px-4 py-3 text-xs font-semibold text-rose-500">
                          <span>No</span>
                          <span>Teks uji</span>
                          <span>Expected</span>
                          <span>Actual</span>
                          <span>Status</span>
                        </div>
                        <div className="max-h-96 divide-y divide-rose-100 overflow-y-auto">
                          {minimumTestResults.map((item) => (
                            <div key={item.id} className="grid grid-cols-[0.45fr_2fr_0.7fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-sm">
                              <span className="text-rose-700/80">{item.id}</span>
                              <span className="text-rose-900">{item.text}</span>
                              <span className="font-semibold text-rose-900">{item.expectedScore}</span>
                              <span className="font-semibold text-rose-900">{item.actualScore}</span>
                              <span className={item.consistent ? 'text-emerald-700' : 'text-rose-700'}>
                                {item.consistent ? 'Konsisten' : 'Tidak konsisten'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section id="cta" className="pb-20">
              <div className="rounded-[2.25rem] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-300 p-8 text-white shadow-[0_28px_100px_rgba(229,85,154,0.36)] sm:p-10 lg:p-12">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                      Buka tiap fitur sebagai halaman khusus dan belajar lebih fokus.
                    </h2>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
