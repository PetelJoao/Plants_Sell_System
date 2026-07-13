"use client"

import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Layers,
  Users,
  Home as HomeIcon,
  Building2,
  Hammer,
  Wrench,
  ChevronDown,
  Compass,
  Quote,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Sparkles,
    title: "Design profissional",
    description:
      "Aceda a plantas arquitetónicas criadas por profissionais, prontas a customizar para o seu projeto.",
  },
  {
    icon: Layers,
    title: "Pensado para a vida moderna",
    description:
      "Layouts abertos, espaços flexíveis e ambientes funcionais adaptados às necessidades de hoje.",
  },
  {
    icon: HomeIcon,
    title: "Download rápido",
    description:
      "Descarregue a sua planta em segundos, sem complicações, pronta para avançar com o projeto.",
  },
  {
    icon: Users,
    title: "Profissionais qualificados a um clique",
    description:
      "Fale com arquitetos e engenheiros verificados diretamente na plataforma quando precisar de ajuda.",
  },
]

const useCases = [
  {
    icon: HomeIcon,
    title: "Donos de Casa a Explorar o Sonho",
    description:
      "Transforme ideias soltas numa planta clara com a Duria, dando estrutura à casa que sempre imaginou.",
  },
  {
    icon: Building2,
    title: "Arquitetos e Estúdios de Design",
    description:
      "Use a Duria para explorar opções espaciais e refinar plantas de forma rápida e eficiente.",
  },
  {
    icon: Hammer,
    title: "Promotores Imobiliários",
    description:
      "Gere soluções de layout escaláveis alinhadas com as tendências de mercado e a procura dos compradores.",
  },
  {
    icon: Wrench,
    title: "Projetos de Renovação",
    description:
      "Melhore espaços existentes com a Duria e crie uma planta prática que preserva a estrutura original.",
  },
]

const testimonials = [
  {
    name: "Beatriz Fonseca",
    role: "Designer de Interiores",
    quote:
      "Precisava de uma planta rápida para um projeto de renovação e a Duria ajudou-me a transformar ideias soltas num layout claro em minutos.",
  },
  {
    name: "Rui Almeida",
    role: "Arquiteto",
    quote:
      "A visualização em 2.5D dá um ótimo equilíbrio entre detalhe e clareza, o que facilita muito apresentar conceitos aos meus clientes.",
  },
  {
    name: "Sandra Neto",
    role: "Gestora de Projeto",
    quote:
      "Uso a Duria com frequência nas fases iniciais de um projeto e ela dá-me sempre um ponto de partida prático para refinar depois.",
  },
  {
    name: "Diogo Pereira",
    role: "Dono de Casa",
    quote:
      "Estava a planear a renovação de um pequeno apartamento e a Duria tornou tudo mais simples, sem me sentir sobrecarregado.",
  },
]

const faqs = [
  {
    question: "O que é a Duria?",
    answer:
      "A Duria é uma plataforma moderna que ajuda a criar e explorar plantas arquitetónicas residenciais, focada em design de alta qualidade e facilidade de uso.",
  },
  {
    question: "Quem pode usar a Duria?",
    answer:
      "A Duria é indicada para donos de casa, arquitetos, designers de interiores, empreiteiros e promotores imobiliários que procuram uma forma mais rápida e visual de criar plantas.",
  },
  {
    question: "Posso usar a Duria para projetos de renovação?",
    answer:
      "Sim. A Duria suporta tanto construção nova como renovação, permitindo criar uma planta que melhora a funcionalidade e a circulação dos espaços.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Todos os pagamentos são processados de forma segura na plataforma, garantindo que os seus dados e transações estão sempre protegidos.",
  },
]

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F1] font-[Inter,sans-serif]">
      {/* Global type system + blueprint pattern utilities (visual only) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");

        .font-display {
          font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
        }
        .font-mono-label {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          letter-spacing: 0.08em;
        }
        .blueprint-grid {
          background-image:
            linear-gradient(rgba(16, 26, 46, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 26, 46, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .blueprint-grid-dark {
          background-image:
            linear-gradient(rgba(247, 245, 241, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(247, 245, 241, 0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .corner-frame {
          position: relative;
        }
        .corner-frame::before,
        .corner-frame::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: #c79a56;
          z-index: 10;
        }
        .corner-frame::before {
          top: -10px;
          left: -10px;
          border-top: 2px solid #c79a56;
          border-left: 2px solid #c79a56;
        }
        .corner-frame::after {
          bottom: -10px;
          right: -10px;
          border-bottom: 2px solid #c79a56;
          border-right: 2px solid #c79a56;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F7F5F1]/90 backdrop-blur-md border-b border-[#E4E0D8] transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-[#101A2E] tracking-tight"
          >
            Duria
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-[#101A2E]/80 hover:text-[#101A2E] transition-colors">
                Plantas
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 absolute left-0 mt-2 w-56 rounded-xl border border-[#E4E0D8] bg-white shadow-lg shadow-[#101A2E]/5 p-2">
                <button
                  onClick={() => router.push("/Develop/dashboard/Plantas")}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-[#101A2E]/80 hover:bg-[#F7F5F1] hover:text-[#101A2E] transition-colors"
                >
                  Criador de Plantas
                </button>
                <button
                  onClick={() => router.push("/Develop/dashboard/Plantas")}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-[#101A2E]/80 hover:bg-[#F7F5F1] hover:text-[#101A2E] transition-colors"
                >
                  Editor de Plantas
                </button>
              </div>
            </div>

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-[#101A2E]/80 hover:text-[#101A2E] transition-colors">
                Design de Casas
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 absolute left-0 mt-2 w-56 rounded-xl border border-[#E4E0D8] bg-white shadow-lg shadow-[#101A2E]/5 p-2">
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-[#101A2E]/80 hover:bg-[#F7F5F1] hover:text-[#101A2E] transition-colors"
                >
                  Design Exterior
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-[#101A2E]/80 hover:bg-[#F7F5F1] hover:text-[#101A2E] transition-colors"
                >
                  Design Interior
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm text-[#101A2E]/80 hover:bg-[#F7F5F1] hover:text-[#101A2E] transition-colors"
                >
                  Design de Jardim
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push("/Develop/dashboard")}
              className="text-sm font-medium text-[#101A2E]/80 hover:text-[#101A2E] transition-colors"
            >
              Meus Projetos
            </button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-[#101A2E]/80 hover:text-[#101A2E] transition-colors"
            >
              Contacto
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#101A2E]/70 hover:text-[#101A2E] transition-colors"
            >
              Login
            </Link>
            <Link href="/Develop/Cadastro">
              <Button className="bg-[#101A2E] text-white hover:bg-[#1c2c4a] rounded-full px-5 shadow-sm shadow-[#101A2E]/20 transition-all">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden blueprint-grid py-24 sm:py-32">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(199,154,86,0.12) 0%, rgba(247,245,241,0) 70%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C79A56]/40 bg-white/70 px-4 py-1.5 font-mono-label text-[11px] uppercase text-[#8a6a38]">
              <Compass className="h-3.5 w-3.5" />
              Planeamento arquitetónico inteligente
            </div>
            <h1 className="font-display mt-6 text-4xl font-bold text-[#101A2E] sm:text-5xl sm:tracking-tight lg:text-6xl">
              Dê Vida à Casa dos Seus Sonhos com a Duria
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-[#55617A]">
              A Duria combina planeamento de espaços profissional com ferramentas intuitivas para
              desbloquear todo o potencial do seu próximo projeto.
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => router.push("/Develop/dashboard/Plantas")}
                className="bg-[#C79A56] text-[#101A2E] hover:bg-[#b0813f] active:bg-[#96702f] px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center shadow-lg shadow-[#C79A56]/30 transition-all hover:-translate-y-0.5"
              >
                Explorar Plantas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="corner-frame rounded-2xl overflow-hidden shadow-2xl shadow-[#101A2E]/15 border border-[#E4E0D8] bg-white">
              <img
                src="https://d28pk2nlhhgcne.cloudfront.net/assets/app/uploads/sites/3/2025/12/3d-topview-homepage.png"
                alt="Planta arquitetónica e render 3D da Duria"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono-label text-center text-xs uppercase text-[#8a6a38]">
              Porque escolher a Duria
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-center text-[#101A2E]">
              A Duria supera as plataformas tradicionais
            </h2>
            <p className="mt-4 text-center text-lg text-[#55617A] max-w-2xl mx-auto">
              A Duria integra design inteligente, layouts modernos e colaboração fluida numa única
              plataforma intuitiva.
            </p>
            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#E4E0D8] bg-white p-6 transition-all hover:shadow-lg hover:shadow-[#101A2E]/5 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#101A2E]">
                    <feature.icon className="h-5 w-5 text-[#C79A56]" />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-semibold text-[#101A2E]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#55617A]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3">
              {["Pagamento seguro", "Download rápido", "Criar Eventos"].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#3F7A5C]" />
                  <span className="text-sm font-medium text-[#101A2E]/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="relative overflow-hidden blueprint-grid-dark py-20 bg-[#101A2E]">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Excelência Arquitetónica em cada Planta Duria
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#c7cede]">
              Milhares de famílias já desenharam a casa dos seus sonhos com a Duria. Vamos criar o
              cenário perfeito para os melhores momentos da sua vida — comece hoje.
            </p>
            <div className="mt-8">
              <Link href="/Develop/Cadastro">
                <Button className="bg-[#C79A56] text-[#101A2E] hover:bg-[#dcae6a] px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5">
                  Comece a sua Jornada
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono-label text-center text-xs uppercase text-[#8a6a38]">
              Para cada perfil
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-center text-[#101A2E]">
              Soluções Duria para cada etapa do seu projeto
            </h2>
            <p className="mt-4 text-center text-lg text-[#55617A] max-w-2xl mx-auto">
              A Duria permite visualizar, construir e renovar espaços com ferramentas inteligentes
              feitas para a vida moderna.
            </p>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group rounded-2xl overflow-hidden border border-[#E4E0D8] bg-white transition-all hover:shadow-lg hover:shadow-[#101A2E]/5"
                >
                  <div className="overflow-hidden">
                    <img
                      src={`https://placehold.co/400x300/101A2E/F7F5F1?text=${encodeURIComponent(useCase.title)}`}
                      alt={useCase.title}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#F7F5F1] border border-[#E4E0D8]">
                      <useCase.icon className="h-4.5 w-4.5 text-[#101A2E]" />
                    </div>
                    <h3 className="font-display mt-3 font-semibold text-[#101A2E]">
                      {useCase.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#55617A]">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28 bg-white border-y border-[#E4E0D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono-label text-center text-xs uppercase text-[#8a6a38]">
              Depoimentos
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-center text-[#101A2E]">
              Vozes reais dos nossos utilizadores
            </h2>
            <p className="mt-4 text-center text-lg text-[#55617A] max-w-2xl mx-auto">
              Estas experiências mostram como a Duria apoia diferentes fluxos de trabalho, com
              rapidez e clareza.
            </p>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-[#F7F5F1] border border-[#E4E0D8] p-6 transition-all hover:shadow-md"
                >
                  <Quote className="h-5 w-5 text-[#C79A56]" />
                  <p className="mt-3 text-sm leading-relaxed text-[#3a4256]">
                    {testimonial.quote}
                  </p>
                  <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#E4E0D8]">
                    <img
                      src={`https://placehold.co/80x80/101A2E/F7F5F1?text=${testimonial.name.charAt(0)}`}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#101A2E]">{testimonial.name}</p>
                      <p className="text-xs text-[#55617A]">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono-label text-center text-xs uppercase text-[#8a6a38]">
              Dúvidas frequentes
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-center text-[#101A2E]">
              Perguntas Frequentes sobre a Duria
            </h2>
            <p className="mt-4 text-center text-lg text-[#55617A]">
              Encontre respostas rápidas sobre como a Duria funciona e como criar a sua planta.
            </p>
            <div className="mt-12 divide-y divide-[#E4E0D8] rounded-2xl border border-[#E4E0D8] bg-white px-6">
              {faqs.map((faq, index) => (
                <details key={index} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between text-left font-semibold text-[#101A2E] list-none">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 text-[#C79A56] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[#55617A]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28 bg-white border-t border-[#E4E0D8]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#101A2E]">
              Comece a construir a sua planta ideal hoje
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#55617A]">
              Transforme as suas ideias em layouts inspiradores e funcionais. A Duria dá-lhe as
              ferramentas para planear o espaço perfeito com confiança.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => router.push("/Develop/dashboard/Plantas")}
                className="bg-[#101A2E] text-white hover:bg-[#1c2c4a] px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center shadow-lg shadow-[#101A2E]/20 transition-all hover:-translate-y-0.5"
              >
                Explorar a Duria Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="blueprint-grid-dark bg-[#101A2E] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-1">
              <h4 className="font-display text-xl font-bold">Duria</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#9aa3b8]">
                A Duria ajuda a criar plantas arquitetónicas em segundos, para dar vida à casa dos
                seus sonhos com clareza.
              </p>
            </div>

            <div>
              <h5 className="font-mono-label text-xs text-[#C79A56] uppercase">Plantas</h5>
              <ul className="mt-4 space-y-2 text-sm text-[#9aa3b8]">
                <li>
                  <Link href="/plantas/criar" className="hover:text-white transition-colors">
                    Criador de Plantas
                  </Link>
                </li>
                <li>
                  <Link href="/plantas/editor" className="hover:text-white transition-colors">
                    Editor de Plantas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono-label text-xs text-[#C79A56] uppercase">Design de Casas</h5>
              <ul className="mt-4 space-y-2 text-sm text-[#9aa3b8]">
                <li>
                  <Link href="/design/exterior" className="hover:text-white transition-colors">
                    Design Exterior
                  </Link>
                </li>
                <li>
                  <Link href="/design/interior" className="hover:text-white transition-colors">
                    Design Interior
                  </Link>
                </li>
                <li>
                  <Link href="/design/jardim" className="hover:text-white transition-colors">
                    Design de Jardim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono-label text-xs text-[#C79A56] uppercase">Outras Ferramentas</h5>
              <ul className="mt-4 space-y-2 text-sm text-[#9aa3b8]">
                <li>
                  <Link href="/projetos" className="hover:text-white transition-colors">
                    Meus Projetos
                  </Link>
                </li>
                <li>
                  <Link href="/Develop/Cadastro" className="hover:text-white transition-colors">
                    Cadastrar
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono-label text-xs text-[#C79A56] uppercase">Sobre</h5>
              <ul className="mt-4 space-y-2 text-sm text-[#9aa3b8]">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-white transition-colors">
                    Contactos
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-[#9aa3b8]">
            © {new Date().getFullYear()} Duria. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}