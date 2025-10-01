import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Users, 
  Heart,
  Navigation,
  Camera,
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { 
  AnimatedBackground, 
  ScrollProgressIndicator, 
  EnhancedCard, 
  RippleButton,
  AnimatedCounter,
  FloatingElement,
  TypewriterText,
  AdvancedImage
} from '@/components/ui/enhanced';
import { useScrollReveal } from '@/hooks/useAdvancedAnimations';

interface Temple {
  _id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
}

const fetchFeaturedTemples = async (): Promise<Temple[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/temples?limit=6&featured=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch temples');
    }
    const data = await response.json();
    return data.data.temples || [];
  } catch (error) {
    console.error('Error fetching featured temples:', error);
    return [];
  }
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const heroRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const templesRef = useScrollReveal();

  const { data: featuredTemples = [] } = useQuery({
    queryKey: ['featured-temples'],
    queryFn: fetchFeaturedTemples,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/temples');
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Find Nearby Temples',
      description: 'Discover temples around you with our location-based search and detailed directions.',
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from fellow devotees and share your own spiritual experiences.',
    },
    {
      icon: TrendingUp,
      title: 'Popular Destinations',
      description: 'Explore trending temples and discover new spiritual destinations across India.',
    },
    {
      icon: Camera,
      title: 'Rich Media Gallery',
      description: 'View high-quality photos and virtual tours of temples before your visit.',
    },
    {
      icon: Clock,
      title: 'Updated Information',
      description: 'Get current timings, festivals, and special events happening at temples.',
    },
    {
      icon: Navigation,
      title: 'Easy Navigation',
      description: 'Get precise directions and travel information for seamless temple visits.',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Temples Listed' },
    { number: '50,000+', label: 'Happy Pilgrims' },
    { number: '28', label: 'States Covered' },
    { number: '4.8/5', label: 'Average Rating' },
  ];

  const benefits = [
    'Comprehensive temple database',
    'Authentic user reviews',
    'Detailed travel information',
    'Festival and event updates',
    'Mobile-friendly platform',
    'Community-driven content',
  ];

  return (
    <AnimatedBackground>
      <ScrollProgressIndicator />
      <div className="flex flex-col min-h-screen page-transition">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-24 px-4 text-background relative overflow-hidden">
          {/* Enhanced animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-secondary/20"></div>
          <FloatingElement delay={0} intensity="strong">
            <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={1} intensity="strong">
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/15 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={2} intensity="subtle">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-full blur-3xl"></div>
          </FloatingElement>
          
          <div className="container mx-auto text-center relative z-10">
            <div 
              ref={heroRef.ref}
              className={`transition-all duration-1000 ${
                heroRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-8 drop-shadow-2xl leading-tight text-shadow-strong">
                <span className="gradient-text-animated">
                  Discover Sacred Temples
                </span>
              </h1>
              <div className="text-xl md:text-2xl mb-12 opacity-95 max-w-4xl mx-auto leading-relaxed font-medium">
                <TypewriterText 
                  text="Explore India's spiritual heritage with DivyaYatri - your trusted companion for sacred journeys"
                  speed={40}
                />
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="stagger-animation">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative mb-12">
                <div className="flex glass-strong rounded-2xl p-3 shadow-2xl border border-secondary/30 hover:border-secondary/50 transition-all duration-300 group">
                  <Input
                    type="text"
                    placeholder="Search temples by name, city, or deity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 text-foreground placeholder:text-foreground/60 bg-transparent text-lg py-3 focus:outline-none"
                  />
                  <RippleButton 
                    type="submit" 
                    size="lg" 
                    className="ml-3 px-8 py-3 rounded-xl shadow-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </RippleButton>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center stagger-animation">
              <Link to="/temples">
                <RippleButton 
                  size="xl" 
                  variant="secondary" 
                  className="w-full sm:w-auto shadow-xl hover:shadow-2xl"
                >
                  Browse All Temples
                </RippleButton>
              </Link>
              <Link to="/about">
                <RippleButton 
                  size="xl" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-background text-background hover:bg-background hover:text-primary shadow-xl hover:shadow-2xl"
                >
                  Learn More
                </RippleButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-16 bg-gradient-to-r from-background via-muted/10 to-background border-b border-border shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-accent/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div 
              ref={statsRef.ref}
              className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${
                statsRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <EnhancedCard 
                    variant="glass" 
                    hoverEffect="scale"
                    delay={index * 0.1}
                    className="p-6 border border-secondary/10 hover:border-secondary/30"
                  >
                    <div className="text-4xl md:text-5xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">
                      {stat.number.includes('+') ? (
                        <>
                          <AnimatedCounter end={parseInt(stat.number.replace(/[+,]/g, ''))} />
                          {stat.number.includes('k') && 'k'}
                          {stat.number.includes('+') && '+'}
                        </>
                      ) : (
                        stat.number
                      )}
                    </div>
                    <div className="text-foreground/80 text-sm md:text-base font-medium">{stat.label}</div>
                  </EnhancedCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/3 via-transparent to-accent/3"></div>
          <FloatingElement delay={0}>
            <div className="absolute top-10 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          </FloatingElement>
          <FloatingElement delay={1}>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
          </FloatingElement>
          
          <div className="container mx-auto relative z-10">
            <div 
              ref={featuresRef.ref}
              className={`text-center mb-16 transition-all duration-1000 ${
                featuresRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-shadow-soft">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Why Choose DivyaYatri?
                </span>
              </h2>
              <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                We make your spiritual journey smoother with comprehensive temple information and community insights.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <EnhancedCard 
                    key={index} 
                    variant="glass" 
                    hoverEffect="lift"
                    delay={index * 0.1}
                    className="text-center overflow-hidden relative"
                  >
                    <CardHeader className="p-8">
                      <div className="relative mb-6">
                        <FloatingElement delay={index * 0.2}>
                          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                            <Icon className="h-10 w-10 text-accent group-hover:text-secondary transition-colors duration-300" />
                          </div>
                        </FloatingElement>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardTitle className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-foreground/70 leading-relaxed text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </EnhancedCard>
                );
              })}
            </div>
          </div>
        </section>

      {/* Featured Temples Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-muted/10 via-background to-muted/10 border-y border-border/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Featured Temples</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">Discover some of the most visited and highly rated temples across India</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredTemples.length > 0 ? (
              featuredTemples.map((temple) => (
                <Card key={temple._id} className="temple-card group overflow-hidden hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer bg-background/90 backdrop-blur-sm rounded-3xl border-0">
                  <div className="h-56 relative overflow-hidden rounded-t-3xl">
                    {temple.images[0] ? (
                      <img
                        src={temple.images[0]}
                        alt={temple.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/20 flex items-center justify-center text-primary text-7xl group-hover:scale-110 transition-transform duration-500">
                        🕉
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">{temple.name}</CardTitle>
                    <CardDescription className="text-foreground/70 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-accent" />
                      {temple.location.city}, {temple.location.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-sm text-foreground/70 mb-6 line-clamp-2 leading-relaxed">
                      {temple.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                          <Star className="h-4 w-4 text-secondary fill-current" />
                          <span className="text-sm font-semibold">{temple.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-foreground/60">({temple.reviewCount} reviews)</span>
                      </div>
                      <Link to={`/temple/${temple._id}`}>
                        <Button variant="outline" size="sm" className="rounded-full px-4 hover:bg-primary hover:text-background transition-all duration-300">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Enhanced fallback mock data
              [1, 2, 3, 4, 5, 6].map((temple) => (
                <Card key={temple} className="temple-card group overflow-hidden hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer bg-background/90 backdrop-blur-sm rounded-3xl border-0">
                  <div className="h-56 bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/20 flex items-center justify-center text-primary text-7xl group-hover:scale-110 transition-transform duration-500 rounded-t-3xl">
                    🕉
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="group-hover:text-primary transition-colors duration-300">Sacred Temple {temple}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-accent" />
                      City, State
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-sm text-foreground/70 mb-6 leading-relaxed">
                      A beautiful temple with rich history and spiritual significance for devotees.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                          <Star className="h-4 w-4 text-secondary fill-current" />
                          <span className="text-sm font-semibold">4.8</span>
                        </div>
                        <span className="text-xs text-foreground/60">(127 reviews)</span>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full px-4 hover:bg-primary hover:text-background transition-all duration-300">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Link to="/temples">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90">
                View All Temples
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                Everything You Need for Your Spiritual Journey
              </h2>
              <p className="text-xl text-foreground/80 mb-10 leading-relaxed">
                DivyaYatri provides comprehensive information and tools to make your temple visits 
                meaningful and hassle-free. Join our community of spiritual seekers.
              </p>
              
              <div className="space-y-6 mb-10">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-6 w-6 text-accent group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    <span className="text-foreground font-medium text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    Join DivyaYatri
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-2xl border-2 hover:bg-primary hover:text-background shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center p-8 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer group bg-background/80 backdrop-blur-sm rounded-3xl border-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-accent group-hover:text-secondary transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-300">Community</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">Connect with fellow devotees and share spiritual experiences</p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer group bg-background/80 backdrop-blur-sm rounded-3xl border-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-accent group-hover:text-secondary transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-300">Spiritual</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">Deepen your spiritual practice with guided insights</p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer group bg-background/80 backdrop-blur-sm rounded-3xl border-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-accent group-hover:text-secondary transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-300">Discover</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">Explore new sacred places and hidden gems</p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-3 transition-all duration-500 ease-out cursor-pointer group bg-background/80 backdrop-blur-sm rounded-3xl border-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-accent group-hover:text-secondary transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-300">Reviews</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">Share authentic reviews and read trusted feedback</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Separator */}
      <div className="h-2 bg-gradient-to-r from-transparent via-secondary/40 to-transparent relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-secondary/20 to-accent/20 blur-sm"></div>
      </div>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-secondary/20"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-secondary leading-tight">
            Ready to Begin Your Spiritual Journey?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-4xl mx-auto text-background leading-relaxed">
            Join thousands of devotees who trust DivyaYatri for their temple visits. 
            Start exploring today and discover the sacred.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link to="/temples">
              <Button size="lg" className="w-full sm:w-auto px-10 py-5 text-xl font-bold rounded-2xl bg-secondary text-primary hover:bg-background hover:text-primary transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-110 transform">
                Start Exploring
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-5 text-xl font-bold rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-110 transform">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </AnimatedBackground>
  );
}