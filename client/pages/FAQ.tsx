import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  Bus,
  MapPin,
  Clock,
  Smartphone,
  Shield,
  CreditCard,
  Settings,
  Users,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function FAQ() {
  const faqCategories = [
    {
      id: "general",
      title: "General Information",
      icon: HelpCircle,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "What is Busनियोजक?",
          answer:
            "Busनियोजक is a smart transit platform that helps you track buses in real-time, plan routes, and get live updates about Delhi's public transportation system. We provide accurate bus timing, route information, and help make your daily commute easier and more predictable.",
        },
        {
          question: "Is the service free to use?",
          answer:
            "Yes! Our basic bus tracking, route planning, and real-time information services are completely free for all users. We also offer premium features for enhanced experience, but core functionality remains free.",
        },
        {
          question: "Which cities are covered?",
          answer:
            "Currently, we focus on Delhi NCR region including Delhi, Gurgaon, Noida, and Faridabad. We're working to expand to other major Indian cities based on user demand.",
        },
        {
          question: "How accurate is the real-time data?",
          answer:
            "Our GPS tracking system provides location updates every 30 seconds with an accuracy of ±10 meters. Bus arrival predictions are accurate within 2-3 minutes under normal traffic conditions.",
        },
      ],
    },
    {
      id: "search",
      title: "Bus Search & Routes",
      icon: Search,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "How do I search for a specific bus?",
          answer:
            "You can search for buses in multiple ways: Enter the route number directly (e.g., 101, AC-42), search by route name, or use our route planner to find buses between two stops. The search is smart and will show all relevant results.",
        },
        {
          question: "Can I plan a journey between two locations?",
          answer:
            "Absolutely! Use our route planner feature to enter your starting point and destination. We'll show you all available bus options, including direct routes and connections with transfer details.",
        },
        {
          question: "What if my bus route is not showing?",
          answer:
            "We're constantly updating our database. If a route is missing, please report it through our contact form or email us at hello@busनियोजक.com. We typically add new routes within 24-48 hours.",
        },
        {
          question: "How do I know which bus to take?",
          answer:
            "Each search result shows the complete route, estimated travel time, current bus location, and next departure time. You can also see passenger capacity to choose less crowded buses.",
        },
      ],
    },
    {
      id: "tracking",
      title: "Live Tracking",
      icon: MapPin,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "How does live bus tracking work?",
          answer:
            "Our system uses GPS devices installed in buses to track their real-time location. This data is processed and displayed on our interactive map, showing you exactly where the bus is and when it will arrive at your stop.",
        },
        {
          question: "Why is the bus location not updating?",
          answer:
            "This can happen due to GPS signal issues, maintenance, or if the bus is temporarily out of service. We show the last known location and estimated arrival based on schedule. Try refreshing the page or check again in a few minutes.",
        },
        {
          question: "Can I get notifications for my bus?",
          answer:
            "Yes! You can set up notifications for specific buses or routes. We'll send you alerts when your bus is approaching your stop, if there are delays, or service disruptions.",
        },
        {
          question: "What do the different colors on the map mean?",
          answer:
            "Green dots indicate buses that are on time, yellow for slight delays (5-10 minutes), and red for significant delays (10+ minutes). Gray dots show buses that are currently out of service or at the depot.",
        },
      ],
    },
    {
      id: "mobile",
      title: "Mobile App & Website",
      icon: Smartphone,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "Is there a mobile app available?",
          answer:
            "Currently, we offer a fully responsive web application that works perfectly on all mobile devices. A dedicated mobile app for iOS and Android is in development and will be available soon.",
        },
        {
          question: "Does the website work offline?",
          answer:
            "The website requires an internet connection for real-time data. However, we cache route information and recently viewed buses for quick access. Some basic features work with limited connectivity.",
        },
        {
          question: "How do I enable location services?",
          answer:
            "When prompted by your browser, click 'Allow' to enable location access. This helps us show nearby bus stops and suggest relevant routes. You can manage location permissions in your browser settings.",
        },
        {
          question: "Why is the website loading slowly?",
          answer:
            "Slow loading can be due to poor internet connection or high server traffic. Try refreshing the page, clearing your browser cache, or using a different network. Contact us if the problem persists.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Privacy",
      icon: Shield,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "Do I need to create an account?",
          answer:
            "No account is required for basic features like bus search and tracking. However, creating an account lets you save favorite routes, set personalized notifications, and access trip history.",
        },
        {
          question: "What personal information do you collect?",
          answer:
            "We only collect information you voluntarily provide (email for notifications) and anonymous usage data to improve our service. We never share personal information with third parties. See our Privacy Policy for details.",
        },
        {
          question: "How can I delete my account?",
          answer:
            "You can delete your account anytime by contacting our support team at support@busनियोजक.com. We'll permanently remove all your personal data within 30 days.",
        },
        {
          question: "Is my location data secure?",
          answer:
            "Yes, your location data is encrypted and used only to provide relevant bus information. We don't store or track your location history, and you can disable location services anytime.",
        },
      ],
    },
    {
      id: "support",
      title: "Support & Feedback",
      icon: Users,
      color: "from-red-700 to-black",
      questions: [
        {
          question: "How can I report incorrect bus information?",
          answer:
            "Please use our contact form or email us at support@busनियोजक.com with specific details about the incorrect information. Include route number, route, and what needs to be corrected. We typically fix issues within 24 hours.",
        },
        {
          question: "Can I suggest new features?",
          answer:
            "Absolutely! We love hearing from users. Send your suggestions to hello@busनियोजक.com or use our contact form. Popular requests are prioritized for future updates.",
        },
        {
          question: "How do I contact customer support?",
          answer:
            "You can reach us via email at support@busनियोजक.com, through our contact form, or call our helpline at +91-9876-543-210. We respond to all queries within 24 hours.",
        },
        {
          question: "What should I do if I find a bug?",
          answer:
            "Please report bugs immediately to support@busनियोजक.com. Include details about what you were doing, what went wrong, and your device/browser information. We prioritize bug fixes and usually resolve them within 48 hours.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white ">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-red-500">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 flex flex-col">
              <span className="text-white">Frequently Asked</span>
              <span className="mx-auto"> Questions</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Find answers to common questions about{" "}
              <span className="text-white font-semibold">Bus</span>
              <span className="text-white font-semibold">नियोजक</span>. Can't
              find what you're looking for? Contact our support team!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="text-sm bg-white text-red-500 hover:bg-gray-50 transition-colors px-4 py-2 font-semibold">
                <HelpCircle className="h-3 w-3 mr-1" />
                Instant Answers
              </Badge>
              <Badge className="text-sm bg-white text-red-500 hover:bg-gray-50 transition-colors px-4 py-2 font-semibold">
                <MessageCircle className="h-3 w-3 mr-1" />
                24/7 Support
              </Badge>
              <Badge className="text-sm bg-white text-red-500 hover:bg-gray-50 transition-colors px-4 py-2 font-semibold">
                <Users className="h-3 w-3 mr-1" />
                Community Help
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {faqCategories.map((category, index) => (
              <Card
                key={category.id}
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl hover:scale-[1.02]"
              >
                <CardHeader className="text-center">
                  <div className="bg-red-500 text-white p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <category.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">
                    {category.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {category.questions.length} questions answered
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full bg-red-500 text-white hover:bg-red-500 transition-all duration-200"
                    onClick={() => {
                      document
                        .getElementById(`category-${category.id}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    View Questions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-24 max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 text-center">
                    {category.title}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      className="border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <span className="text-left font-semibold text-lg text-gray-900">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Can't find the answer you're looking for? Our support team is here
            to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-red-500 hover:bg-gray-50 hover:text-red-500 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link to="/contact">
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-red-500 hover:bg-gray-50 hover:text-red-500 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="h-5 w-5 mr-2" />
                Call Helpline
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
