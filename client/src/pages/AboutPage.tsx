import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  MapPin, 
  Star, 
  Search, 
  Shield, 
  BookOpen,
  Globe,
  Smartphone,
  Camera
} from 'lucide-react';
import { 
  AnimatedBackground, 
  ScrollProgressIndicator, 
  EnhancedCard, 
  RippleButton,
  AnimatedCounter,
  FloatingElement,
  TypewriterText 
} from '@/components/ui/enhanced';
import { useScrollReveal } from '@/hooks/useAdvancedAnimations';

export default function AboutPage() {
  const heroRef = useScrollReveal();
  const missionRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const valuesRef = useScrollReveal();
  
  const features = [
    {
      icon: Search,
      title: 'Discover Temples',
      description: 'Find temples across India with detailed information, photos, and reviews from fellow devotees.'
    },
    {
      icon: MapPin,
      title: 'Easy Navigation',
      description: 'Get precise directions and location details to reach your chosen spiritual destination.'
    },
    {
      icon: Star,
      title: 'Authentic Reviews',
      description: 'Read genuine reviews and experiences shared by pilgrims and spiritual seekers.'
    },
    {
      icon: Camera,
      title: 'Rich Media',
      description: 'Explore temples through high-quality photos and virtual tours before your visit.'
    },
    {
      icon: BookOpen,
      title: 'Cultural Insights',
      description: 'Learn about temple history, traditions, and spiritual significance of each sacred place.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access all features on-the-go with our responsive design and mobile-optimized experience.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Temples Listed' },
    { number: '50,000+', label: 'Happy Pilgrims' },
    { number: '28', label: 'States Covered' },
    { number: '4.8/5', label: 'User Rating' }
  ];

  const team = [
    {
      name: 'Spiritual Heritage',
      role: 'Our Mission',
      description: 'Preserving and promoting India\'s rich spiritual heritage through technology.',
      icon: Heart
    },
    {
      name: 'Community Driven',
      role: 'Our Approach',
      description: 'Building a community of devotees sharing authentic experiences and knowledge.',
      icon: Users
    },
    {
      name: 'Modern Technology',
      role: 'Our Method',
      description: 'Using cutting-edge technology to make spiritual journeys accessible to all.',
      icon: Globe
    }
  ];

  return (
    <AnimatedBackground>
      <ScrollProgressIndicator />
      <div className="page-transition">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          </FloatingElement>
          <FloatingElement delay={1.5}>
            <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/15 rounded-full blur-lg"></div>
          </FloatingElement>
          <FloatingElement delay={3}>
            <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/10 rounded-full blur-xl"></div>
          </FloatingElement>
        </div>

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div 
                ref={heroRef.ref}
                className={`transition-all duration-1000 ${
                  heroRef.isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-10'
                }`}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-soft">
                  <span className="gradient-text-animated">
                    About DivyaYatri
                  </span>
                </h1>
                <div className="text-xl md:text-2xl text-text/80 mb-8 leading-relaxed max-w-3xl mx-auto">
                  <TypewriterText 
                    text="Your trusted companion for spiritual journeys across India. We connect devotees with sacred temples, making every pilgrimage meaningful and accessible."
                    speed={30}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center stagger-animation">
                  <Link to="/temples">
                    <RippleButton size="lg" variant="primary" className="w-full sm:w-auto shadow-lg hover:shadow-xl">
                      Explore Temples
                    </RippleButton>
                  </Link>
                  <Link to="/register">
                    <RippleButton size="lg" variant="outline" className="w-full sm:w-auto shadow-lg hover:shadow-xl">
                      Join Our Community
                    </RippleButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div 
              ref={missionRef.ref}
              className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${
                missionRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-soft">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-lg md:text-xl text-text/80 leading-relaxed">
                DivyaYatri was born from a simple belief: every spiritual seeker deserves access to 
                authentic information about India's sacred temples. We bridge the gap between ancient 
                wisdom and modern convenience, making spiritual exploration accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-animation">
              {team.map((item, index) => {
                const Icon = item.icon;
                return (
                  <EnhancedCard 
                    key={index} 
                    variant="glass-strong" 
                    hoverEffect="lift"
                    delay={index * 0.2}
                    className="text-center"
                  >
                    <CardHeader>
                      <FloatingElement delay={index * 0.3}>
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-10 w-10 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">{item.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-primary">
                        {item.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text/70 group-hover:text-text transition-colors duration-300">{item.description}</p>
                    </CardContent>
                  </EnhancedCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 bg-gradient-to-r from-primary via-primary/90 to-secondary text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div 
              ref={statsRef.ref}
              className={`text-center mb-16 transition-all duration-1000 ${
                statsRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-strong">DivyaYatri by Numbers</h2>
              <p className="text-white/80 text-lg">
                Trusted by thousands of pilgrims across India
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-animation">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <EnhancedCard 
                    variant="glass-subtle" 
                    hoverEffect="scale"
                    delay={index * 0.1}
                    className="p-6 bg-white/10 backdrop-blur-sm"
                  >
                    <div className="text-4xl md:text-5xl font-bold mb-2 text-white group-hover:text-secondary transition-colors duration-300">
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
                    <div className="text-white/80 text-sm md:text-base">{stat.label}</div>
                  </EnhancedCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div 
              ref={featuresRef.ref}
              className={`text-center mb-16 transition-all duration-1000 ${
                featuresRef.isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-soft">
                <span className="bg-gradient-to-r from-primary to-secondary">
                  Why Choose DivyaYatri?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-text/80 max-w-3xl mx-auto leading-relaxed">
                We provide comprehensive tools and information to make your spiritual journey 
                smooth, informed, and deeply meaningful.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <EnhancedCard 
                    key={index} 
                    variant="glass" 
                    hoverEffect="lift"
                    delay={index * 0.1}
                    className="overflow-hidden relative"
                  >
                    <CardHeader className="relative">
                      <FloatingElement delay={index * 0.2}>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-text/70 group-hover:text-text transition-colors duration-300">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </EnhancedCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div 
                ref={valuesRef.ref}
                className={`text-center mb-16 transition-all duration-1000 ${
                  valuesRef.isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-10'
                }`}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-soft">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Our Values
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-text/80 max-w-2xl mx-auto">
                  The principles that guide us in serving the spiritual community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-animation">
                <EnhancedCard variant="glass-strong" hoverEffect="lift" delay={0.1}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <FloatingElement>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Authenticity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/70 group-hover:text-text transition-colors duration-300">
                      We verify all temple information and encourage genuine reviews to ensure 
                      authentic experiences for every pilgrim.
                    </p>
                  </CardContent>
                </EnhancedCard>

                <EnhancedCard variant="glass-strong" hoverEffect="lift" delay={0.2}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <FloatingElement delay={0.5}>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Heart className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Respect</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/70 group-hover:text-text transition-colors duration-300">
                      We honor all spiritual traditions and beliefs, creating an inclusive space 
                      for seekers from every background.
                    </p>
                  </CardContent>
                </EnhancedCard>

                <EnhancedCard variant="glass-strong" hoverEffect="lift" delay={0.3}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <FloatingElement delay={1}>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Community</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/70 group-hover:text-text transition-colors duration-300">
                      We believe in the power of shared experiences and foster a supportive 
                      community of spiritual travelers.
                    </p>
                  </CardContent>
                </EnhancedCard>

                <EnhancedCard variant="glass-strong" hoverEffect="lift" delay={0.4}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <FloatingElement delay={1.5}>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                      </FloatingElement>
                      <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Knowledge</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/70 group-hover:text-text transition-colors duration-300">
                      We preserve and share the rich cultural and spiritual knowledge associated 
                      with India's sacred places.
                    </p>
                  </CardContent>
                </EnhancedCard>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-shadow-strong">
                Begin Your Spiritual Journey Today
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of devotees who trust DivyaYatri for their spiritual travels. 
                Discover, explore, and connect with the sacred.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center stagger-animation">
                <Link to="/temples">
                  <RippleButton 
                    size="xl" 
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-2xl hover:shadow-3xl border-4 border-double"
                  >
                    Start Exploring
                  </RippleButton>
                </Link>
                <Link to="/contact">
                  <RippleButton 
                    variant="outline" 
                    size="xl" 
                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary font-semibold shadow-2xl hover:shadow-3xl"
                  >
                    Get in Touch
                  </RippleButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  );
}