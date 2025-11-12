import { Button } from "./ui/button";
import { GraduationCap, MessageCircle, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero({ onGetStarted, onLogin }) {
 return (
 <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-background">
 {/* Hero Section */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
 <div className="grid lg:grid-cols-2 gap-12 items-center">
 <div className="space-y-8">
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
 <Sparkles className="w-4 h-4 text-primary" />
 <span className="text-sm text-primary">AI-Powered Career Companion</span>
 </div>
 
 <div className="space-y-4">
 <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight">
 Your Personalized Career Companion
 </h1>
 <p className="text-lg text-muted-foreground max-w-xl">
 Discover your ideal career path with AI-powered recommendations, connect with mentors, 
 and find internships tailored to your skills and aspirations.
 </p>
 </div>
 
 <div className="flex flex-wrap gap-4">
 <Button size="lg" onClick={onGetStarted} className="gap-2 shadow-lg shadow-primary/25">
 Get Started
 <ArrowRight className="w-4 h-4" />
 </Button>
 <Button size="lg" variant="outline" onClick={onLogin}>
 Login
 </Button>
 </div>

 <div className="flex items-center gap-8 pt-4">
 <div>
 <div className="text-2xl text-primary">50+</div>
 <div className="text-sm text-muted-foreground">Career Paths</div>
 </div>
 <div>
 <div className="text-2xl text-primary">10K+</div>
 <div className="text-sm text-muted-foreground">Students Helped</div>
 </div>
 <div>
 <div className="text-2xl text-primary">95%</div>
 <div className="text-sm text-muted-foreground">Satisfaction</div>
 </div>
 </div>
 </div>

 <div className="relative">
 <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
 <ImageWithFallback
 src="https://images.unsplash.com/photo-1758876019673-704b039d405c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZXIlMjBncm93dGglMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MjMwMjM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
 alt="Career growth illustration"
 className="w-full h-full object-cover"
 />
 </div>
 <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center">
 <GraduationCap className="w-6 h-6 text-white" />
 </div>
 <div>
 <div className="text-sm text-muted-foreground">Success Rate</div>
 <div className="text-lg">95% Match</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Features Section */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl sm:text-4xl mb-4">Everything You Need to Succeed</h2>
 <p className="text-muted-foreground max-w-2xl mx-auto">
 Kazini provides comprehensive tools to guide your career journey from exploration to employment
 </p>
 </div>

 <div className="grid md:grid-cols-3 gap-8">
 <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
 <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mb-4">
 <Sparkles className="w-6 h-6 text-white" />
 </div>
 <h3 className="mb-2">Career Recommendations</h3>
 <p className="text-muted-foreground">
 Get personalized career suggestions based on your skills, interests, and goals with our AI-powered matching system.
 </p>
 </div>

 <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
 <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-3 to-chart-5 flex items-center justify-center mb-4">
 <MessageCircle className="w-6 h-6 text-white" />
 </div>
 <h3 className="mb-2">Mentorship Chatbot</h3>
 <p className="text-muted-foreground">
 Connect with Kazini Mentor AI 24/7 for instant career advice, skill development tips, and personalized guidance.
 </p>
 </div>

 <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
 <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-4 to-chart-2 flex items-center justify-center mb-4">
 <Briefcase className="w-6 h-6 text-white" />
 </div>
 <h3 className="mb-2">Internship Listings</h3>
 <p className="text-muted-foreground">
 Browse curated internship and job opportunities that match your profile and career aspirations.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
