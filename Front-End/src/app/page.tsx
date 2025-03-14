import { ArrowRight, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Duria</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Architectural Plans Made Easy
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Discover and customize professional architectural plans for your dream home or project.
            </p>
            <div className="mt-8 flex justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
                Explore Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Duria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                "Professional Designs",
                "Customizable Plans",
                "Instant Downloads",
                "Affordable Pricing",
                "Expert Support",
                "Regular Updates",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-xl font-bold">Duria</h4>
              <p className="text-sm text-gray-400">Architectural Plans SaaS</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Privacy
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Duria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

