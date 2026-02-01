import { Link } from 'react-router-dom'
import { ArrowRight, User, BarChart2, PenSquare, Smartphone, Smile, Lock, Cloud, LifeBuoy, Quote, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Slider Section - Matching old WordPress theme style */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-[url('/slider-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-blue-300 text-lg mb-4 font-medium tracking-wide uppercase">Welcome!</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            The Right Agency For Your
          </h1>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            <span className="text-amber-400">Business</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Our business consulting company delivers strategic insights and tailored solutions to drive growth and efficiency. 
            We partner with you to navigate challenges and achieve your goals with expert guidance and innovative strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg">
              Learn More
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold text-lg px-8 py-4 rounded-lg transition-colors">
              Services
            </Link>
          </div>
        </div>
      </section>

      {/* Top Info Bar */}
      <section className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 mb-2 text-amber-300" />
              <p className="font-semibold">Email Us</p>
              <p className="text-blue-100 text-sm">info@pricepoint.agency</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 mb-2 text-amber-300" />
              <p className="font-semibold">Call Us</p>
              <p className="text-blue-100 text-sm">803-479-3667</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 mb-2 text-amber-300" />
              <p className="font-semibold">Location</p>
              <p className="text-blue-100 text-sm">Columbia, South Carolina</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 mb-2 text-amber-300" />
              <p className="font-semibold">Opening Hours</p>
              <p className="text-blue-100 text-sm">Mon-Sat: 10AM - 6PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We are experienced professionals who care about your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Expert Work */}
            <div className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Expert Work</h3>
              <p className="text-slate-600">
                Expert work involves the application of specialized knowledge and skills to perform complex tasks efficiently and accurately.
              </p>
            </div>

            {/* Networking */}
            <div className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Networking</h3>
              <p className="text-slate-600">
                Networking involves building and nurturing professional relationships to exchange information, support, and opportunities.
              </p>
            </div>

            {/* Creative Design */}
            <div className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Creative Design</h3>
              <p className="text-slate-600">
                Creative design merges artistic vision with practical functionality to develop innovative and aesthetically pleasing solutions.
              </p>
            </div>

            {/* Mobility */}
            <div className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mobility</h3>
              <p className="text-slate-600">
                Mobility refers to the ability to move freely and efficiently, often enhanced by advancements in transportation and technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Services</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive solutions tailored to meet your unique needs, ensuring exceptional quality and customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Customer Services */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Smile className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Customer Services</h3>
                <p className="text-slate-600 mb-4">
                  Our customer service team is dedicated to delivering prompt, friendly, and effective support to ensure your complete satisfaction.
                </p>
                <Link to="/pricing" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Cyber Security */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Lock className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Cyber Security</h3>
                <p className="text-slate-600 mb-4">
                  Our cybersecurity solutions protect your digital assets with advanced technologies and proactive strategies.
                </p>
                <Link to="/pricing" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Cloud Computing */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Cloud className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Cloud Computing</h3>
                <p className="text-slate-600 mb-4">
                  Our cloud computing services offer scalable, secure, and cost-effective solutions to optimize your business operations.
                </p>
                <Link to="/pricing" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* IT Management */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <LifeBuoy className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">IT Management</h3>
                <p className="text-slate-600 mb-4">
                  Our IT management services streamline and enhance your technological infrastructure, ensuring optimal performance.
                </p>
                <Link to="/pricing" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">About Us</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A business consulting company provides expert advice and services to businesses to help them improve their performance, solve problems, and achieve their goals. 
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Consultants often bring specialized knowledge and experience in areas like strategy, management, operations, finance, marketing, and technology.
              </p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">✓</span>
                  Strategic Planning & Growth
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">✓</span>
                  Operational Improvement
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">✓</span>
                  Financial Advisory
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-2">✓</span>
                  IT & Technology Consulting
                </li>
              </ul>
              <Link to="/book" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors">
                Learn More <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Our Core Values</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Strategic Planning</h4>
                    <p className="text-blue-100 text-sm">Helping businesses develop long-term goals and strategies to achieve growth and success.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Change Management</h4>
                    <p className="text-blue-100 text-sm">Helping businesses navigate changes such as mergers, acquisitions, or organizational restructuring.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Risk Management</h4>
                    <p className="text-blue-100 text-sm">Ensuring businesses adhere to regulations and manage risks effectively.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Client Success Stories</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our clients have achieved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Price Point Agency helped us scale from zero to $100k+ monthly revenue in just 8 months!",
                name: "Sarah M.",
                business: "E-commerce Business"
              },
              {
                quote: "Their startup package saved us months of work and thousands in legal fees. Highly recommend!",
                name: "Michael T.",
                business: "SaaS Startup"
              },
              {
                quote: "The business valuation and growth strategy helped us secure our Series A funding.",
                name: "Jennifer L.",
                business: "Real Estate Tech"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <Quote className="w-8 h-8 text-blue-500 mb-4" />
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Let's build something great together. Book a free consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg">
              Book Free Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold text-lg px-8 py-4 rounded-lg transition-colors">
              Client Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
