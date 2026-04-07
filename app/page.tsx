export default function Home() {
  const features = [
    {
      title: "Materi etika digital yang aplikatif",
      description:
        "Pelajari jejak digital, privasi, empati online, keamanan, dan tanggung jawab bermedia sosial lewat modul yang mudah dipahami.",
    },
    {
      title: "AI analisis perilaku online",
      description:
        "Sistem AI membantu membaca pola interaksi digital, memberi insight kebiasaan online, dan menyoroti area yang perlu diperbaiki.",
    },
    {
      title: "Refleksi dan rekomendasi personal",
      description:
        "Setiap pengguna mendapat umpan balik personal, target pembelajaran, dan saran kebiasaan digital yang lebih sehat dan etis.",
    },
  ];

  const programs = [
    "Privasi Digital",
    "Etika Bermedia Sosial",
    "Deteksi Risiko Perilaku",
    "Literasi AI",
  ];

  const testimonials = [
    {
      name: "Nadia Safira",
      role: "Mahasiswa",
      quote:
        "Aplikasi ini bikin aku lebih sadar cara berkomentar, membagikan konten, dan menjaga jejak digital. Insight AI-nya terasa membantu banget.",
    },
    {
      name: "Dimas Pratama",
      role: "Guru Informatika",
      quote:
        "Materinya relevan untuk siswa zaman sekarang. Bagian analisis perilaku online membantu diskusi kelas jadi lebih konkret dan reflektif.",
    },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,105,180,0.24),transparent_55%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-10 lg:px-12">
        <header className="mb-12 flex flex-col gap-5 rounded-full border border-white/60 bg-white/65 px-6 py-4 shadow-[0_16px_50px_rgba(203,72,139,0.14)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-rose-400 to-orange-200 text-lg font-bold text-white shadow-lg shadow-pink-300/60">
              E
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Etika Digital AI</p>
              <p className="text-sm text-rose-700/75">E-learning etika digital dengan analisis perilaku online</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-rose-950/75">
            <a className="rounded-full px-4 py-2 transition hover:bg-pink-100" href="#fitur">
              Fitur
            </a>
            <a className="rounded-full px-4 py-2 transition hover:bg-pink-100" href="#program">
              Program
            </a>
            <a className="rounded-full px-4 py-2 transition hover:bg-pink-100" href="#testimoni">
              Testimoni
            </a>
            <a
              className="rounded-full bg-rose-950 px-5 py-2.5 text-white transition hover:bg-rose-900"
              href="#cta"
            >
              Mulai Belajar
            </a>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur">
              Platform pembelajaran untuk membangun kebiasaan digital yang aman, empatik, dan bertanggung jawab
            </span>
            <h1 className="mt-7 font-display text-5xl leading-tight font-semibold tracking-tight text-rose-950 sm:text-6xl lg:text-7xl">
              Belajar etika digital dengan dukungan AI yang menganalisis perilaku online secara lebih cerdas.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-rose-950/75 sm:text-xl">
              Etika Digital AI membantu pelajar, guru, dan masyarakat memahami dampak perilaku online melalui materi interaktif, evaluasi adaptif, dan insight berbasis AI.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-300 px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(239,68,145,0.38)] transition hover:-translate-y-0.5"
                href="#cta"
              >
                Coba Gratis 7 Hari
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/80 px-7 py-4 text-base font-semibold text-rose-900 backdrop-blur transition hover:bg-pink-50"
                href="#program"
              >
                Lihat Kelas Populer
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
                <p className="text-3xl font-bold text-rose-950">18K+</p>
                <p className="mt-1 text-sm text-rose-800/70">Pengguna aktif</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
                <p className="text-3xl font-bold text-rose-950">40+</p>
                <p className="mt-1 text-sm text-rose-800/70">Modul etika digital</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
                <p className="text-3xl font-bold text-rose-950">92%</p>
                <p className="mt-1 text-sm text-rose-800/70">Peningkatan kesadaran digital</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-pink-300/40 via-white/50 to-orange-200/40 blur-2xl" />
            <div className="grid gap-5 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_28px_90px_rgba(187,67,129,0.2)] backdrop-blur">
              <div className="rounded-[1.75rem] bg-gradient-to-br from-rose-950 via-rose-900 to-pink-700 p-7 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">
                  Featured Program
                </p>
                <h2 className="mt-4 max-w-sm font-display text-3xl leading-tight font-semibold">
                  Etika Digital & AI Behavior Insight
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-pink-100/90">
                  Program ini menggabungkan pembelajaran etika digital, simulasi kasus, dan analisis AI untuk membangun perilaku online yang lebih sehat.
                </p>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-pink-200/80">Akurasi insight perilaku</p>
                    <p className="text-4xl font-bold">89%</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 px-4 py-3 text-right backdrop-blur">
                    <p className="text-sm text-pink-100/80">Fokus minggu ini</p>
                    <p className="text-xl font-semibold">Jejak Digital</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                  <p className="text-sm font-semibold text-rose-700">Pemetaan perilaku</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-rose-950/80">
                        <span>Empati dalam komentar</span>
                        <span>86%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-pink-100">
                        <div className="h-2.5 w-[86%] rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-rose-950/80">
                        <span>Kesadaran privasi</span>
                        <span>78%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-pink-100">
                        <div className="h-2.5 w-[78%] rounded-full bg-gradient-to-r from-fuchsia-400 to-orange-300" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-rose-950/80">
                        <span>Kontrol impuls berbagi</span>
                        <span>83%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-pink-100">
                        <div className="h-2.5 w-[83%] rounded-full bg-gradient-to-r from-rose-500 to-pink-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
                  <p className="text-sm font-semibold text-rose-700">Topik utama</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {programs.map((program) => (
                      <span
                        key={program}
                        className="rounded-full bg-pink-100 px-3 py-2 text-sm font-medium text-rose-900"
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[var(--shadow-soft)] backdrop-blur sm:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-600">
              Kenapa platform ini
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-rose-950">
              Semua yang dibutuhkan untuk memahami etika digital secara lebih mendalam
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-[1.75rem] border border-[var(--border-soft)] bg-gradient-to-b from-white to-pink-50/70 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950 text-base font-bold text-white">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-rose-950">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-rose-950/70">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="program"
        className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-12 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12"
      >
        <div className="rounded-[2rem] bg-rose-950 p-8 text-white shadow-[0_24px_70px_rgba(104,19,59,0.28)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-200">
            Learning Path
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
            Jalur belajar dari kesadaran digital sampai perubahan perilaku
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-pink-100/85">
            Pembelajaran dirancang untuk membantu pengguna memahami konsep, menilai kebiasaan online, lalu memperbaikinya secara bertahap dengan dukungan AI.
          </p>
        </div>

        <div className="grid gap-4">
          {[
            {
              step: "01",
              title: "Awareness",
              text: "Kenali dasar etika digital, dampak jejak online, serta risiko komunikasi digital yang tidak bijak.",
            },
            {
              step: "02",
              title: "Analysis",
              text: "AI membaca pola perilaku online dari simulasi, kuis, dan aktivitas belajar untuk memberi gambaran kebiasaan digital pengguna.",
            },
            {
              step: "03",
              title: "Improvement",
              text: "Terapkan rekomendasi personal, evaluasi perkembangan, dan bangun karakter digital yang lebih aman dan bertanggung jawab.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[var(--shadow-soft)] backdrop-blur"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-rose-800">
                  {item.step}
                </span>
                <h3 className="text-2xl font-semibold text-rose-950">{item.title}</h3>
              </div>
              <p className="mt-4 text-base leading-7 text-rose-950/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="testimoni"
        className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12"
      >
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-[var(--shadow-soft)] backdrop-blur sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-600">
              Testimoni
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-rose-950">
              Membantu pengguna jadi lebih sadar dan lebih bijak di ruang digital
            </h2>
            <p className="mt-4 text-base leading-8 text-rose-950/70">
              Platform ini tidak hanya mengajarkan teori, tetapi juga membantu pengguna memahami bagaimana perilaku online mereka terbentuk dan bisa diperbaiki.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-[1.75rem] border border-[var(--border-soft)] bg-gradient-to-b from-pink-50 to-white p-6"
              >
                <p className="text-lg leading-8 text-rose-950/80">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-8">
                  <p className="text-lg font-semibold text-rose-950">{testimonial.name}</p>
                  <p className="text-sm text-rose-700/75">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="mx-auto w-full max-w-7xl px-6 py-12 pb-20 sm:px-10 lg:px-12">
        <div className="rounded-[2.25rem] bg-gradient-to-r from-pink-500 via-rose-500 to-orange-300 p-8 text-white shadow-[0_28px_100px_rgba(229,85,154,0.36)] sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-100">
                Siap mulai?
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Bangun generasi yang lebih etis, aman, dan cerdas dalam berperilaku online.
              </h2>
              <p className="mt-4 text-base leading-8 text-pink-50/90">
                Mulai pembelajaran etika digital sekarang dan gunakan insight AI untuk memahami serta meningkatkan perilaku online secara nyata.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-semibold text-rose-700 transition hover:bg-rose-50"
                href="#"
              >
                Daftar Sekarang
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                href="#fitur"
              >
                Pelajari Fitur
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
