import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Settings,
  Bell,
  Lock,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  emergencyContact: string;
  preferredLanguage: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  memberSince: string;
  accountStatus: "active" | "suspended" | "pending";
  verificationStatus: {
    email: boolean;
    phone: boolean;
  };
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    dateOfBirth: "1990-05-15",
    address: "123 Main Street, Block A",
    city: "New Delhi",
    emergencyContact: "+91-9876543211",
    preferredLanguage: "English",
    emailNotifications: true,
    smsNotifications: false,
    memberSince: "January 2024",
    accountStatus: "active",
    verificationStatus: {
      email: true,
      phone: false,
    },
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setMessage(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(editedProfile);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => ({
        ...prev,
        verificationStatus: { ...prev.verificationStatus, phone: true }
      }));
      setMessage({ type: "success", text: "Phone verification sent! Check your SMS." });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send verification. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile.name}
                </h3>
                <p className="text-gray-600 mb-2">{profile.email}</p>
                <Badge 
                  variant={profile.accountStatus === "active" ? "default" : "secondary"}
                  className="mb-4"
                >
                  {profile.accountStatus.charAt(0).toUpperCase() + profile.accountStatus.slice(1)}
                </Badge>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since {profile.memberSince}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Verification Status */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Verification Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </span>
                      {profile.verificationStatus.email ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </span>
                      {profile.verificationStatus.phone ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleVerifyPhone}
                            disabled={loading}
                          >
                            Verify
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Preferences
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/security">
                    <Lock className="h-4 w-4 mr-2" />
                    Security & Privacy
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedProfile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dob"
                        type="date"
                        value={editedProfile.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={editedProfile.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergency"
                        value={editedProfile.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        placeholder="Emergency contact number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.emergencyContact}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Textarea
                      id="address"
                      value={editedProfile.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    {isEditing ? (
                      <select
                        id="language"
                        value={editedProfile.preferredLanguage}
                        onChange={(e) => handleInputChange("preferredLanguage", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिंदी</option>
                        <option value="Punjabi">ਪੰਜਾਬੀ</option>
                        <option value="Urdu">اردو</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{profile.preferredLanguage}</p>
                    )}
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedProfile.emailNotifications}
                          onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                          className="rounded"
                        />
                      ) : (
                        <Badge variant={profile.emailNotifications ? "default" : "secondary"}>
                          {profile.emailNotifications ? "Enabled" : "Disabled"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editedProfile.smsNotifications}
                          onChange={(e) => handleInputChange("smsNotifications", e.target.checked)}
                          className="rounded"
                        />
                      ) : (
                        <Badge variant={profile.smsNotifications ? "default" : "secondary"}>
                          {profile.smsNotifications ? "Enabled" : "Disabled"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-6 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-500 mb-3">
                      Once you delete your account, there is no going back. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
