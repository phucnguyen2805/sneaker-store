import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function AboutPage() {
  const { language } = useThemeLanguage();
  const t = translations[language];

  const features = [
    {
      number: "01",
      title: t.about.features.product.title,
      description: t.about.features.product.description,
    },
    {
      number: "02",
      title: t.about.features.inventory.title,
      description: t.about.features.inventory.description,
    },
    {
      number: "03",
      title: t.about.features.experience.title,
      description: t.about.features.experience.description,
    },
  ];

  const technologies = [
    "Java 17",
    "Spring Boot",
    "Spring Data JPA",
    "Spring Security",
    "JWT",
    "MySQL",
    "Liquibase",
    "ReactJS",
    "Vite",
    "Tailwind CSS",
    "Redux Toolkit",
    "Axios",
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f6]">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-[#f7f7f6]">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                {t.about.hero.eyebrow}
              </p>

              <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-neutral-950 sm:text-6xl lg:text-7xl">
                {t.about.hero.title}
              </h1>
            </div>

            <div className="max-w-2xl lg:pb-2">
              <p className="text-lg leading-8 text-neutral-600">
                {t.about.hero.description}
              </p>

              <p className="mt-5 text-base leading-7 text-neutral-500">
                {t.about.hero.secondaryDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.about.overview.eyebrow}
              </p>

              <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                {t.about.overview.title}
              </h2>
            </div>

            <div className="grid gap-8 text-sm leading-7 text-neutral-600 sm:grid-cols-2">
              <p>{t.about.overview.paragraphOne}</p>

              <p>{t.about.overview.paragraphTwo}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-neutral-200 bg-[#f7f7f6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.about.features.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                {t.about.features.title}
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-neutral-500">
              {t.about.features.description}
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group bg-white p-7 transition-all duration-300 hover:bg-neutral-50 sm:p-8"
              >
                <p className="text-sm font-semibold tracking-tight text-neutral-400 transition-colors duration-300 group-hover:text-neutral-950">
                  {feature.number}
                </p>

                <h3 className="mt-12 text-lg font-semibold tracking-tight text-neutral-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / Tech */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.about.technology.eyebrow}
              </p>

              <h2 className="mt-4 max-w-sm text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                {t.about.technology.title}
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-neutral-500">
                {t.about.technology.description}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-8 border-t border-neutral-200 pt-8 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t.about.technology.backend}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {t.about.technology.backendDescription}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t.about.technology.frontend}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {t.about.technology.frontendDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-[#f7f7f6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="rounded-[2rem] bg-neutral-950 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                  {t.about.workflow.eyebrow}
                </p>

                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                  {t.about.workflow.title}
                </h2>
              </div>

              <div>
                <div className="border-t border-white/10 py-5">
                  <p className="text-sm font-medium text-white">
                    01 — {t.about.workflow.stepOne.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    {t.about.workflow.stepOne.description}
                  </p>
                </div>

                <div className="border-t border-white/10 py-5">
                  <p className="text-sm font-medium text-white">
                    02 — {t.about.workflow.stepTwo.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    {t.about.workflow.stepTwo.description}
                  </p>
                </div>

                <div className="border-y border-white/10 py-5">
                  <p className="text-sm font-medium text-white">
                    03 — {t.about.workflow.stepThree.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    {t.about.workflow.stepThree.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="max-w-3xl text-sm leading-7 text-neutral-400">
                {t.about.workflow.footer}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
