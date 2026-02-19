import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Bus,
  MessageCircle,
  HeadphonesIcon,
  Globe,
  Heart,
  Users,
  TrendingUp,
  CheckCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Option 1: Direct Formspree submission (recommended)
      const response = await fetch('https://formspree.io/f/xnnbyqkr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          _replyto: email.trim().toLowerCase(),
          _subject: `New Contact Form: ${subject.trim()}`,
        }),
      });

      if (response.ok) {
        // Reset form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        
        // Show success notification
        setShowSuccess(true);
        setShowError(false);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setErrorMessage("Failed to send message. Please check your connection and try again.");
      setShowError(true);
      setShowSuccess(false);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "busniyojak.com",
      description: "Get in touch via email",
      color: "text-primary",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+91-9876-543-210",
      description: "24/7 customer support",
      color: "text-green-600",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "New Delhi, India",
      description: "Our headquarters",
      color: "text-primary",
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "Mon-Fri 9AM-6PM",
      description: "Business hours",
      color: "text-blue-600",
    },
  ];

  const supportTypes = [
    {
      icon: Bus,
      title: "Bus Operations",
      description: "Route queries, schedule information, and bus tracking",
      email: "busniyojak@gmail.com",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      description: "App issues, website problems, and technical assistance",
      email: "busniyojak@gmail.com",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageCircle,
      title: "General Inquiries",
      description: "General questions, feedback, and suggestions",
      email: "busniyojak@gmail.com",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Globe,
      title: "Partnership",
      description: "Business partnerships and collaboration opportunities",
      email: "busniyojak@gmail.com",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Message Sent Successfully!</p>
              <p className="text-sm text-green-100">We'll get back to you soon.</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md">
            <div className="flex-shrink-0">
              <X className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Error Sending Message</p>
              <p className="text-sm text-red-100">{errorMessage}</p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="flex-shrink-0 text-red-200 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6">
              Get in <span className="text-[rgba(220,38,38,1)]">Touch</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Have questions about{" "}
              <span className="text-black font-semibold">&nbsp;Bus</span>
              <span className="text-red-500 font-semibold">नियोजक</span>? Need
              support? Want to partner with us? We're here to help and excited
              to connect with you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg bg-white/90 transition-shadow hover:shadow-2xl rounded-2xl"
              >
                <CardContent className="pt-10 pb-8">
                  <div
                    className={`bg-gradient-to-br from-primary/10 to-accent/10 rounded-full p-3 sm:p-4 lg:p-5 w-16 sm:w-18 lg:w-20 h-16 sm:h-18 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-5 flex items-center justify-center shadow-md`}
                  >
                    <info.icon className={`h-9 w-9 ${info.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground">
                    {info.title}
                  </h3>
                  <p className="text-sm sm:text-base text-foreground font-medium mb-1">
                    {info.value}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-primary/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center space-x-3">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-md">
                      <Send className="h-6 w-6" />
                    </div>
                    <span>Send us a Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        disabled={loading}
                        rows={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Support Types */}
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Choose Your{" "}
                  <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Support Type
                  </span>
                </h2>
                <p className="text-muted-foreground">
                  Select the most appropriate category for faster assistance
                </p>
              </div>

              {supportTypes.map((type, index) => (
                <Card
                  key={index}
                  className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300 rounded-2xl hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`bg-gradient-to-br ${type.color} text-white p-4 rounded-xl shadow-md flex-shrink-0`}
                      >
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground">
                          {type.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {type.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {type.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              <span className="text-blue-600">Frequently Asked</span>{" "}
              <span className="text-purple-600">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How accurate is the real-time bus tracking?",
                answer:
                  "Our GPS tracking system provides location updates every 30 seconds with an accuracy of ±10 meters, ensuring you get the most reliable arrival predictions.",
              },
              {
                question: "Is the Bus नियोजक service free to use?",
                answer:
                  "Yes! Our basic bus tracking and route finding services are completely free for all passengers. We also offer premium features for enhanced experience.",
              },
              {
                question: "How can I report a bus delay or issue?",
                answer:
                  "You can report issues directly through our app, website contact form, or by calling our support line. We respond to all reports within 2 hours.",
              },
              {
                question: "Do you cover all bus routes in the city?",
                answer:
                  "We're constantly expanding our coverage. Currently, we track 50+ major routes and are adding new routes every month based on user demand.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 rounded-2xl"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Immediate Help?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            For urgent issues or emergencies, contact us directly
          </p>
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="lg"
                              className="shadow-md hover:shadow-xl transition-all duration-200 rounded-lg bg-white text-red-500 hover:bg-red-50 hover:text-red-500 font-semibold px-8 py-3"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Helpline
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Advertisement Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Partner with <span className="text-black">Bus</span>
                              <span className="text-red-500">नियोजक</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Reach thousands of daily commuters and grow your business with our
              advertising solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Massive Reach
                    </h3>
                    <p className="text-muted-foreground">
                      Connect with over 10,000+ daily active users across Delhi
                      NCR
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Targeted Advertising
                    </h3>
                    <p className="text-muted-foreground">
                      Place ads on specific routes and bus stops for maximum
                      relevance
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Real-time Analytics
                    </h3>
                    <p className="text-muted-foreground">
                      Track your ad performance with detailed insights and
                      metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - CTA Card */}
            <div>
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <Globe className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      Ready to Advertise?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Join leading brands who trust us to deliver their message
                      to the right audience
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">
                        Multiple ad formats available
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Flexible pricing options</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Dedicated account manager</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                    asChild
                  >
                    <Link to="/advertise-with-us">
                      <Heart className="h-5 w-5 mr-2" />
                      Connect With Us
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
