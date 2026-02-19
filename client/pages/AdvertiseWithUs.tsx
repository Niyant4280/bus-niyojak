import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bus,
  Users,
  MapPin,
  TrendingUp,
  Globe,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Award,
} from "lucide-react";

export default function AdvertiseWithUs() {
  const [selectedPlan, setSelectedPlan] = useState("premium");

  const adFormats = [
    {
      title: "Bus Stop Displays",
      description: "Digital displays at high-traffic bus stops",
      features: ["Prime locations", "High visibility", "Weather-resistant"],
      price: "₹15,000/month",
      icon: MapPin,
    },
    {
      title: "In-Bus Advertising",
      description: "Interior ads inside buses for captive audience",
      features: ["Captive audience", "Extended exposure", "Multiple formats"],
      price: "₹8,000/month",
      icon: Bus,
    },
    {
      title: "Mobile App Banners",
      description: "Digital banners in our mobile application",
      features: ["Targeted reach", "Real-time analytics", "Interactive ads"],
      price: "₹5,000/month",
      icon: Globe,
    },
    {
      title: "Route Sponsorship",
      description: "Sponsor entire bus routes for maximum brand exposure",
      features: [
        "Brand association",
        "Route naming rights",
        "Premium visibility",
      ],
      price: "₹25,000/month",
      icon: Target,
    },
  ];

  const pricingPlans = [
    {
      id: "starter",
      name: "Starter Package",
      price: "₹10,000",
      period: "/month",
      description:
        "Perfect for small businesses starting their advertising journey",
      features: [
        "2 Bus stop displays",
        "Basic analytics",
        "Email support",
        "1 month minimum",
        "Standard locations",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium Package",
      price: "₹25,000",
      period: "/month",
      description: "Most popular choice for growing businesses",
      features: [
        "5 Bus stop displays",
        "In-bus advertising",
        "Advanced analytics",
        "Priority support",
        "Prime locations",
        "Custom ad design",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Package",
      price: "₹50,000",
      period: "/month",
      description: "Comprehensive solution for large-scale campaigns",
      features: [
        "Unlimited displays",
        "Route sponsorship",
        "Mobile app integration",
        "Dedicated account manager",
        "Real-time reporting",
        "Custom solutions",
        "Brand partnership",
      ],
      popular: false,
    },
  ];

  const stats = [
    { label: "Daily Commuters", value: "50,000+", icon: Users },
    { label: "Bus Routes", value: "100+", icon: MapPin },
    { label: "Monthly Impressions", value: "2M+", icon: TrendingUp },
    { label: "Partner Satisfaction", value: "98%", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Advertise with <span className="text-white">Bus</span>
              <span className="text-red-200">नियोजक</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Reach thousands of daily commuters and grow your business with our
              premium advertising solutions
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
                <Globe className="h-4 w-4 mr-2" />
                Digital & Physical Ads
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 mr-2" />
                Real-time Analytics
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
                <Target className="h-4 w-4 mr-2" />
                Targeted Reach
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Formats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advertising Formats
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from multiple advertising formats to reach your target
              audience effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {adFormats.map((format, index) => (
              <Card
                key={index}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-white rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-3 rounded-xl">
                      <format.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{format.title}</CardTitle>
                      <p className="text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {format.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {format.price}
                    </span>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pricing Plans
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing options to suit businesses of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${
                  plan.popular
                    ? "border-2 border-blue-500 scale-105 bg-gradient-to-br from-white to-blue-50"
                    : "border-0 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular ? "Get Started" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Partnership Requirements
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know to get started with our advertising
              platform
            </p>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg border-0 bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span>Business Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Required Documents</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Valid business registration certificate</li>
                      <li>• GST registration number</li>
                      <li>• PAN card of the business</li>
                      <li>• Bank account details</li>
                      <li>• Authorized signatory ID proof</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Content Guidelines</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Family-friendly content only</li>
                      <li>• No misleading claims</li>
                      <li>• Compliance with advertising standards</li>
                      <li>• High-resolution creative assets</li>
                      <li>• Brand guidelines adherence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  <span>Process Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        Application Submission (Day 1)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Submit your application with required documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        Review & Approval (2-3 Days)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews your application and content
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-purple-600 font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        Campaign Setup (1-2 Days)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Configure your campaign and schedule deployment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">
                        4
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Go Live (Day 7)</h4>
                      <p className="text-sm text-muted-foreground">
                        Your ads go live across selected locations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Campaign?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get in touch with our advertising team to discuss your requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <a href="mailto:advertise@busनियोजक.com">
                <Mail className="h-5 w-5 mr-2" />
                Email Us
              </a>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </Button>
          </div>
          <div className="mt-8 text-white/80">
            <p className="text-sm">
              Or visit our office: New Delhi, India | Business Hours: Mon-Fri
              9AM-6PM
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
