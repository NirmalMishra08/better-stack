'use client';

import { useState, useEffect } from 'react';
import {
  Monitor,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Users,
  Clock,
  TrendingUp,
  Smartphone,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Monitor,
      title: "Real-time Monitoring",
      description: "24/7 monitoring with instant alerts when your services go down"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Enterprise-grade security with encrypted data transmission"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second response times with global monitoring locations"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Comprehensive reports and insights into your service performance"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Intelligent alerting with customizable notification channels"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Monitor from multiple locations worldwide for accurate results"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "50ms", label: "Average Response Time" },
    { number: "24/7", label: "Monitoring" },
    { number: "100+", label: "Global Locations" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO, TechCorp",
      content: "Better Uptime has been a game-changer for our infrastructure monitoring. The real-time alerts saved us from multiple potential outages.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "DevOps Lead, StartupXYZ",
      content: "The analytics dashboard is incredibly detailed and the setup was surprisingly simple. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager, InnovateLab",
      content: "The global monitoring locations give us confidence that our users worldwide are getting the best experience.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>

        {/* Secondary gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-cyan-500/10"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-transparent to-pink-500/10"></div>

        {/* Radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/15 via-transparent to-transparent"></div>

        {/* Floating Orbs with better colors */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        {/* Additional texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse-glow">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Better Uptime
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">Pricing</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">Reviews</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                Sign In
              </a>
              <a href="/login" className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Monitor
                </span>
                <br />
                <span className="text-white drop-shadow-lg">
                  Everything
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Advanced website monitoring and uptime tracking with instant alerts.
                Keep your services running 24/7 with our professional monitoring platform.
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <a href="/dashboard" className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-10 py-5 rounded-full text-lg font-semibold hover:from-cyan-500 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-2xl hover:shadow-cyan-500/25 animate-pulse-glow">
                <span>Start Monitoring Free</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/dashboard" className="flex items-center space-x-3 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group">
                <div className="w-14 h-14 glass rounded-full flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <span className="font-medium text-lg">View Dashboard</span>
              </a>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-cyan-500/25">
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white/80 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Why Choose Better Uptime?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto drop-shadow-md">
              Professional monitoring tools designed for modern businesses that demand reliability and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl glass border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-3"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/80 drop-shadow-md">
              See what our customers say about Better Uptime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass p-8 rounded-3xl border border-white/20 hover:border-cyan-400/50 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:-translate-y-3"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className='w-full h-1 bg-gradient-to-br from-cyan-700 via-transparent to-cyan-500/10 '></div>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            Join thousands of businesses already monitoring their services with Better Uptime.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/dashboard" className="bg-white text-blue-600 px-10 py-5 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-white/25">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/dashboard" className="border-2 border-white text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/25">
              View Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Better Uptime</span>
              </div>
              <p className="text-white/80 mb-6 max-w-md">
                Professional website monitoring and uptime tracking platform.
                Keep your services running 24/7 with advanced monitoring and instant alerts.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer hover:shadow-cyan-500/25">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer hover:shadow-cyan-500/25">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer hover:shadow-cyan-500/25">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Features</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">API</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-cyan-400 transition-colors duration-300">Status Page</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 Better Uptime. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 text-sm">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 text-sm">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}