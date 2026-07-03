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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Duria
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                Plantas
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-0 mt-2 w-56 rounded-lg border border-gray-100 bg-white shadow-lg p-2">
                <button
                  onClick={() => router.push("/Develop/dashboard/Plantas")}
                  className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Criador de Plantas
                </button>
                <button
                  onClick={() => router.push("/Develop/dashboard/Plantas")}
                  className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Editor de Plantas
                </button>
              </div>
            </div>

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                Design de Casas
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-0 mt-2 w-56 rounded-lg border border-gray-100 bg-white shadow-lg p-2">
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Design Exterior
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Design Interior
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Design de Jardim
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push("/Develop/dashboard")}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Meus Projetos
            </button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Contacto
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Login
            </Link>
            <Link href="/Develop/Cadastro">
              <Button className="bg-gray-900 text-white hover:bg-gray-700 rounded-full px-5">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Dê Vida à Casa dos Seus Sonhos com a Duria
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              A Duria combina planeamento de espaços profissional com ferramentas intuitivas para
              desbloquear todo o potencial do seu próximo projeto.
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => router.push("/Develop/dashboard/Plantas")}
                className="bg-gray-900 text-white hover:bg-gray-700 px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center"
              >
                Explorar Plantas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
              <img
                src="https://d28pk2nlhhgcne.cloudfront.net/assets/app/uploads/sites/3/2025/12/3d-topview-homepage.png"
                alt="Planta arquitetónica e render 3D da Duria"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Porquê a Duria supera as plataformas tradicionais
            </h2>
            <p className="mt-4 text-center text-lg text-gray-500 max-w-2xl mx-auto">
              A Duria integra design inteligente, layouts modernos e colaboração fluida numa única
              plataforma intuitiva.
            </p>
            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <feature.icon className="h-8 w-8 text-gray-900" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {["Pagamento seguro", "Download rápido", "Criar Eventos"].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Excelência Arquitetónica em cada Planta Duria
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Milhares de famílias já desenharam a casa dos seus sonhos com a Duria. Vamos criar o
              cenário perfeito para os melhores momentos da sua vida — comece hoje.
            </p>
            <div className="mt-8">
              <Link href="/Develop/Cadastro">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 rounded-full text-lg font-semibold">
                  Comece a sua Jornada
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Soluções Duria para cada etapa do seu projeto
            </h2>
            <p className="mt-4 text-center text-lg text-gray-500 max-w-2xl mx-auto">
              A Duria permite visualizar, construir e renovar espaços com ferramentas inteligentes
              feitas para a vida moderna.
            </p>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="rounded-2xl overflow-hidden border border-gray-100">
                  <img
                    src={`https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(useCase.title)}`}
                    alt={useCase.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <useCase.icon className="h-6 w-6 text-gray-900" />
                    <h3 className="mt-3 font-semibold text-gray-900">{useCase.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{useCase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Vozes reais dos nossos utilizadores
            </h2>
            <p className="mt-4 text-center text-lg text-gray-500 max-w-2xl mx-auto">
              Estas experiências mostram como a Duria apoia diferentes fluxos de trabalho, com
              rapidez e clareza.
            </p>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://placehold.co/80x80/e5e7eb/6b7280?text=${testimonial.name.charAt(0)}`}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{testimonial.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Perguntas Frequentes sobre a Duria
            </h2>
            <p className="mt-4 text-center text-lg text-gray-500">
              Encontre respostas rápidas sobre como a Duria funciona e como criar a sua planta.
            </p>
            <div className="mt-12 divide-y divide-gray-200 border-t border-b border-gray-200">
              {faqs.map((faq, index) => (
                <details key={index} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between text-left font-semibold text-gray-900">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-500">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Comece a construir a sua planta ideal hoje
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Transforme as suas ideias em layouts inspiradores e funcionais. A Duria dá-lhe as
              ferramentas para planear o espaço perfeito com confiança.
            </p>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/Develop/dashboard/Plantas")}
                className="bg-gray-900 text-white hover:bg-gray-700 px-8 py-6 rounded-full text-lg font-semibold inline-flex items-center"
              >
                Explorar a Duria Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-1">
              <h4 className="text-xl font-bold">Duria</h4>
              <p className="mt-3 text-sm text-gray-400">
                A Duria ajuda a criar plantas arquitetónicas em segundos, para dar vida à casa dos
                seus sonhos com clareza.
              </p>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Plantas</h5>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
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
              <h5 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Design de Casas</h5>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
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
              <h5 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Outras Ferramentas</h5>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
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
              <h5 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Sobre</h5>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
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

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Duria. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}