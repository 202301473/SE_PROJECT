import React, { useState } from "react";
import { User, Mail, Phone, GraduationCap, Building, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/Card";
import { Label } from "@/Components/ui/Label";

const LawyerProfile = () => {
  const [profileData] = useState({
    fullName: 'John Doe',
    username: 'JohnDoe123',
    email: 'john.doe@example.com',
    phone: '1234567890',
    education: 'Juris Doctor (J.D), Corporate Law',
    lawFirm: 'Doe & Associates LLC',
    experience: '10 Years',
    consultationFee: '1000/hour'
  });

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const ProfileDisplayField = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-200 group">
      <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 transition-colors duration-200">
        {icon}
      </div>
      <div className="flex-1">
        <Label className="text-gray-400 text-xs">{label}</Label>
        <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors duration-200">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10 animate-fade-in">
      <Card className="max-w-3xl mx-auto bg-gray-800/40 backdrop-blur-sm border border-gray-700/50">
        <CardHeader className="text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <span className="text-blue-400 text-xs font-medium">Lawyer Profile</span>
          </div>
          <div className="w-24 h-24 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-2 border-blue-500/30">
            {getInitials(profileData.fullName)}
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-1">
            {profileData.fullName}
          </CardTitle>
          <CardDescription className="text-gray-400">{profileData.education}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3 flex items-center">
              <span className="w-1 h-8 bg-blue-500 rounded-full mr-3"></span>
              Personal Information
            </h2>
            <ProfileDisplayField
              icon={<User className="w-5 h-5" />}
              label="Full Name"
              value={profileData.fullName}
            />
            <ProfileDisplayField
              icon={<User className="w-5 h-5" />}
              label="User Name"
              value={profileData.username}
            />
            <ProfileDisplayField
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={profileData.email}
            />
            <ProfileDisplayField
              icon={<Phone className="w-5 h-5" />}
              label="Phone"
              value={profileData.phone}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3 flex items-center">
              <span className="w-1 h-8 bg-blue-500 rounded-full mr-3"></span>
              Professional Details
            </h2>
            <ProfileDisplayField
              icon={<GraduationCap className="w-5 h-5" />}
              label="Education"
              value={profileData.education}
            />
            <ProfileDisplayField
              icon={<Building className="w-5 h-5" />}
              label="Law Firm"
              value={profileData.lawFirm}
            />
            <ProfileDisplayField
              icon={<Clock className="w-5 h-5" />}
              label="Experience"
              value={profileData.experience}
            />
            <ProfileDisplayField
              icon={<DollarSign className="w-5 h-5" />}
              label="Consultation Fee"
              value={profileData.consultationFee}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerProfile;