import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  Loader2,
  Globe,
  Heart,
  Users
} from 'lucide-react';
import { 
  AnimatedBackground, 
  ScrollProgressIndicator, 
  EnhancedCard, 
  FloatingElement,
  TypewriterText 
} from '@/components/ui/enhanced';
import { useScrollReveal } from '@/hooks/useAdvancedAnimations';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const heroRef = useScrollReveal();
  const formRef = useScrollReveal();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success({
        title: 'Message sent successfully!',
        description: 'We\'ll get back to you within 24 hours.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error({
        title: 'Failed to send message',
        description: 'Please try again later or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hello@divyayatri.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91 80-1234-5678',
      description: 'Mon-Fri from 9am to 6pm',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Bangalore, Karnataka, India',
      description: 'Come say hello at our office',
    },
    {
      icon: Clock,
      title: 'Response Time',
      details: 'Within 24 hours',
      description: 'We respond to all inquiries',
    },
  ];

  const reasons = [
    {
      icon: MessageSquare,
      title: 'General Inquiries',
      description: 'Questions about our platform, features, or services'
    },
    {
      icon: Heart,
      title: 'Temple Submissions',
      description: 'Want to add a temple or update temple information'
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'Interested in partnering with DivyaYatri'
    },
    {
      icon: Globe,
      title: 'Press & Media',
      description: 'Media inquiries and press-related questions'
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
                    Get in Touch
                  </span>
                </h1>
                <div className="text-xl md:text-2xl text-text/80 leading-relaxed max-w-3xl mx-auto">
                  <TypewriterText 
                    text="Have questions, suggestions, or want to share a temple with our community? We'd love to hear from you!"
                    speed={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Enhanced Contact Form */}
              <div 
                ref={formRef.ref}
                className={`transition-all duration-1000 ${
                  formRef.isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-10'
                }`}
              >
                <EnhancedCard variant="glass-strong" hoverEffect="lift" className="shadow-2xl">
                  <CardHeader className="  from-primary/5 to-secondary/5">
                    <CardTitle className="text-3xl font-bold text-shadow-soft">
                      <span className="  from-primary to-secondary bg-clip-text  ">
                        Send us a Message
                      </span>
                    </CardTitle>
                    <CardDescription className="text-text/70 text-base">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-animation">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold text-text">
                            Full Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`glass border-2 transition-all duration-300 hover:scale-105 focus:scale-105 focus:shadow-lg ${
                              errors.name ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                            }`}
                            placeholder="Your full name"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1 reveal-on-scroll revealed">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold text-text">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`glass border-2 transition-all duration-300 hover:scale-105 focus:scale-105 focus:shadow-lg ${
                              errors.email ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                            }`}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1 reveal-on-scroll revealed">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-semibold text-text">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className={`glass border-2 transition-all duration-300 hover:scale-105 focus:scale-105 focus:shadow-lg ${
                            errors.subject ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                          }`}
                          placeholder="What is this about?"
                        />
                        {errors.subject && (
                          <p className="text-red-500 text-xs mt-1 reveal-on-scroll revealed">{errors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold text-text">
                          Message
                        </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:bg-white focus:scale-105 transition-all duration-300 resize-none ${
                          errors.message ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                        }`}
                        placeholder="Tell us more about your inquiry..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                </EnhancedCard>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold   from-primary to-secondary bg-clip-text   mb-8">Contact Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <Card key={index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                        <div className="absolute inset-0   from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <Icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors duration-300" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors duration-300 mb-2">{info.title}</h3>
                              <p className="text-xl text-primary font-semibold mb-2">{info.details}</p>
                              <p className="text-text/70 group-hover:text-text transition-colors duration-300">{info.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold   from-primary to-secondary bg-clip-text   mb-8">What can we help with?</h2>
                <div className="space-y-4">
                  {reasons.map((reason, index) => {
                    const Icon = reason.icon;
                    return (
                      <div key={index} className="group flex items-start gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/80 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-text group-hover:text-primary transition-colors duration-300 mb-2">{reason.title}</h3>
                          <p className="text-text/70 group-hover:text-text transition-colors duration-300">{reason.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fadeInUp">
              <h2 className="text-4xl md:text-5xl font-bold   from-primary to-secondary bg-clip-text   mb-6">Frequently Asked Questions</h2>
              <p className="text-lg md:text-xl text-text/80">
                Quick answers to common questions about DivyaYatri
              </p>
            </div>

            <div className="space-y-6">
              <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <CardHeader className="  from-primary/5 to-secondary/5">
                  <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">How do I add a temple to DivyaYatri?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-text/80 group-hover:text-text transition-colors duration-300 leading-relaxed">
                    You can submit temple information through our contact form or email us directly. 
                    We review all submissions to ensure accuracy and completeness before adding them to our platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <CardHeader className="  from-primary/5 to-secondary/5">
                  <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Is DivyaYatri free to use?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-text/80 group-hover:text-text transition-colors duration-300 leading-relaxed">
                    Yes! DivyaYatri is completely free for all users. We believe spiritual information 
                    should be accessible to everyone, regardless of their economic background.
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <CardHeader className="  from-primary/5 to-secondary/5">
                  <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">How do you verify temple information?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-text/80 group-hover:text-text transition-colors duration-300 leading-relaxed">
                    We work with local communities, temple authorities, and verified contributors to 
                    ensure all information is accurate and up-to-date. User reviews also help us maintain quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <CardHeader className="  from-primary/5 to-secondary/5">
                  <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">Can I write reviews for temples?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-text/80 group-hover:text-text transition-colors duration-300 leading-relaxed">
                    Absolutely! Registered users can write reviews and share their experiences. 
                    This helps other pilgrims make informed decisions about their spiritual journeys.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </AnimatedBackground>
  );
}