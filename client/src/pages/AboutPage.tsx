import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function AboutPage() {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About DivyaYatri
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your trusted companion for spiritual journeys across India. We connect devotees 
              with sacred temples, making every pilgrimage meaningful and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/temples">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Temples
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join Our Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              DivyaYatri was born from a simple belief: every spiritual seeker deserves access to 
              authentic information about India's sacred temples. We bridge the gap between ancient 
              wisdom and modern convenience, making spiritual exploration accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-primary">
                      {item.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">DivyaYatri by Numbers</h2>
            <p className="text-primary-foreground/80">
              Trusted by thousands of pilgrims across India
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose DivyaYatri?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive tools and information to make your spiritual journey 
              smooth, informed, and deeply meaningful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600">
                The principles that guide us in serving the spiritual community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle>Authenticity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We verify all temple information and encourage genuine reviews to ensure 
                    authentic experiences for every pilgrim.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-primary" />
                    <CardTitle>Respect</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We honor all spiritual traditions and beliefs, creating an inclusive space 
                    for seekers from every background.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>Community</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We believe in the power of shared experiences and foster a supportive 
                    community of spiritual travelers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <CardTitle>Knowledge</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We preserve and share the rich cultural and spiritual knowledge associated 
                    with India's sacred places.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Begin Your Spiritual Journey Today
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of devotees who trust DivyaYatri for their spiritual travels. 
              Discover, explore, and connect with the sacred.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/temples">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Exploring
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}