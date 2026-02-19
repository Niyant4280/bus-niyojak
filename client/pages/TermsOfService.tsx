import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";

export default function TermsOfService() {
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
          <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <FileText className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground  mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using{" "}
            <span className="text-black  font-semibold">Bus</span>
              <span className="text-red-500  font-semibold">नियोजक</span>{" "}
            services.
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
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing and using Bus नियोजक ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement.
              </p>
              <div className="bg-blue-50  p-4 rounded-lg border border-blue-200 ">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800  mb-1">
                      Agreement to Terms
                    </h4>
                    <p className="text-sm text-blue-700 ">
                      If you do not agree to abide by the above, please do not
                      use this service.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <span>User Accounts and Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Account Creation
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You must provide accurate and complete information when
                      creating an account
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You are responsible for maintaining the confidentiality of
                      your account credentials
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      You must be at least 13 years old to create an account
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  User Conduct
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Do not use the service for any unlawful or prohibited
                      activities
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Do not attempt to gain unauthorized access to our systems
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Do not interfere with or disrupt the service or servers
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-purple-600" />
                <span>Service Availability and Accuracy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50  p-4 rounded-lg border border-yellow-200 ">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800  mb-1">
                      Service Disclaimer
                    </h4>
                    <p className="text-sm text-yellow-700 ">
                      While we strive for accuracy, bus schedules and real-time
                      information may vary due to traffic, weather, or
                      operational changes.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Service Limitations
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Real-time data depends on third-party sources and may not
                    always be accurate
                  </li>
                  <li>
                    • Service availability may be interrupted for maintenance or
                    technical issues
                  </li>
                  <li>
                    • We do not guarantee uninterrupted access to the service
                  </li>
                  <li>
                    • Bus schedules are subject to change by Delhi Transport
                    Corporation
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Scale className="h-6 w-6 text-green-600" />
                <span>Intellectual Property Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Our Content</h4>
                <p className="text-muted-foreground mb-3">
                  The Bus नियोजक platform, including its design, features, and
                  content, is protected by intellectual property laws.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • All trademarks, logos, and service marks are our property
                  </li>
                  <li>
                    • You may not copy, modify, or distribute our content
                    without permission
                  </li>
                  <li>
                    • You may use our service for personal, non-commercial
                    purposes
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  User Content
                </h4>
                <p className="text-muted-foreground">
                  By submitting content (reviews, feedback, etc.), you grant us
                  a non-exclusive license to use, modify, and display such
                  content in connection with our service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50  p-4 rounded-lg border border-red-200 ">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800  mb-1">
                      Important Notice
                    </h4>
                    <p className="text-sm text-red-500 ">
                      Bus नियोजक is not liable for any missed buses, delays, or
                      travel disruptions resulting from the use of our service.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Liability Limitations
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • We provide information services only and are not
                    responsible for actual bus operations
                  </li>
                  <li>
                    • Users are responsible for verifying information before
                    making travel decisions
                  </li>
                  <li>
                    • We are not liable for indirect, incidental, or
                    consequential damages
                  </li>
                  <li>
                    • Our total liability is limited to the amount paid for our
                    services (if any)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <span>Advertising and Third-Party Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Advertisement Policy
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • We may display advertisements from third-party advertisers
                  </li>
                  <li>
                    • We are not responsible for the content or accuracy of
                    third-party ads
                  </li>
                  <li>
                    • Interactions with advertisers are solely between you and
                    the advertiser
                  </li>
                  <li>
                    • We reserve the right to reject or remove any advertisement
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Advertiser Responsibilities
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Advertisers must comply with all applicable laws and
                    regulations
                  </li>
                  <li>• Content must be appropriate and not misleading</li>
                  <li>
                    • Advertisers are responsible for their own customer service
                    and fulfillment
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <span>Termination and Modifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Account Termination
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You may terminate your account at any time</li>
                  <li>
                    • We may suspend or terminate accounts for violations of
                    these terms
                  </li>
                  <li>
                    • Upon termination, your right to use the service ceases
                    immediately
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Terms Modifications
                </h4>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time.
                  Changes will be effective immediately upon posting. Continued
                  use of the service constitutes acceptance of modified terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Scale className="h-6 w-6 text-green-600" />
                <span>Governing Law and Disputes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Applicable Law
                </h4>
                <p className="text-muted-foreground">
                  These terms are governed by the laws of India. Any disputes
                  will be subject to the exclusive jurisdiction of the courts in
                  New Delhi, India.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">
                  Dispute Resolution
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • We encourage resolving disputes through direct
                    communication first
                  </li>
                  <li>• Formal disputes may be subject to arbitration</li>
                  <li>• Class action lawsuits are not permitted</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50  rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-green-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <h5 className="font-medium">Email</h5>
                        <p className="text-sm text-muted-foreground">
                          legal@busनियोजक.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-blue-600" />
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
                      Bus नियोजक Legal Team
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
