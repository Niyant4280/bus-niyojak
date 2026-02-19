import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white ">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground  mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. Learn how{" "}
            <span className="text-black  font-semibold">Bus</span>
              <span className="text-red-500  font-semibold">नियोजक</span>{" "}
            collects, uses, and protects your information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Eye className="h-6 w-6 text-blue-600" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-primary">
                  Personal Information
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Name, email address, and phone number when you create an
                      account
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Profile information and preferences you provide</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Communication records when you contact our support team
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">
                  Usage Information
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Bus routes searched and travel patterns</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Device information and IP address</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>App usage analytics and performance data</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-green-600" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-primary">
                    Service Provision
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • Provide real-time bus tracking and route information
                    </li>
                    <li>• Personalize your travel experience</li>
                    <li>• Send service notifications and updates</li>
                    <li>• Improve our route recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-primary">
                    Platform Improvement
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Analyze usage patterns to enhance features</li>
                    <li>• Conduct research and development</li>
                    <li>• Ensure platform security and prevent fraud</li>
                    <li>• Provide customer support services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-purple-600" />
                <span>Information Sharing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50  p-4 rounded-lg border border-green-200 ">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800  mb-1">
                      We DO NOT sell your personal information
                    </h4>
                    <p className="text-sm text-green-700 ">
                      Your data is never sold to third parties for marketing
                      purposes.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">
                  Limited Sharing Scenarios
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • With Delhi Transport Corporation for service improvement
                  </li>
                  <li>
                    • With trusted service providers who assist our operations
                  </li>
                  <li>• When required by law or legal proceedings</li>
                  <li>• To protect the safety and security of our users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Lock className="h-6 w-6 text-red-500" />
                <span>Data Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-primary">
                    Technical Safeguards
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• End-to-end encryption for sensitive data</li>
                    <li>• Secure HTTPS connections</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-primary">
                    Organizational Measures
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Employee training on data protection</li>
                    <li>• Limited access on need-to-know basis</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular backup and recovery testing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <span>Your Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You have the following rights regarding your personal
                  information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <h5 className="font-medium">Access</h5>
                        <p className="text-sm text-muted-foreground">
                          Request a copy of your data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <h5 className="font-medium">Correction</h5>
                        <p className="text-sm text-muted-foreground">
                          Update incorrect information
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <h5 className="font-medium">Deletion</h5>
                        <p className="text-sm text-muted-foreground">
                          Request data removal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <h5 className="font-medium">Portability</h5>
                        <p className="text-sm text-muted-foreground">
                          Export your data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <span>Cookies and Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your
                  experience:
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">
                      Essential Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Required for basic functionality like login sessions and
                      security features.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our platform to improve
                      performance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">
                      Preference Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Remember your settings like language and other
                      preferences.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <span>Contact Us</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or want to
                  exercise your rights, contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <h5 className="font-medium">Email</h5>
                        <p className="text-sm text-muted-foreground">
                          privacy@busनियोजक.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <h5 className="font-medium">Phone</h5>
                        <p className="text-sm text-muted-foreground">
                          +91-9876-543-210
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Mailing Address</h5>
                    <p className="text-sm text-muted-foreground">
                      Bus नियोजक Privacy Team
                      <br />
                      New Delhi, India
                      <br />
                      110001
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
