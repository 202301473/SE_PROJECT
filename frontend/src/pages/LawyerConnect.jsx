import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/Card";
import { Button } from "@/Components/ui/Button";

const lawyers = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  name: "Jane Doe",
  specialization: "Juris Doctor (J.D.), Corporate Law",
  photo: null // Will show placeholder
}));

const LawyerConnect = () => {
  const navigate = useNavigate();

  const handleViewProfile = (lawyerId) => {
    navigate(`/lawyer-profile/${lawyerId}`);
  };

  return (
    <div className="container mx-auto py-10 animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
          <span className="text-blue-400 text-xs font-medium">Legal Professionals</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Lawyer Connect
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Connect with qualified lawyers for your legal needs
        </p>
      </div>

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {lawyers.map((lawyer, index) => (
          <Card
            key={lawyer.id}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 transition-all duration-200 p-5 flex flex-col group animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="flex flex-col items-center text-center p-0 mb-4">
              {/* Profile Photo Placeholder */}
              <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-3 group-hover:border-blue-500/50 transition-all duration-200">
                <span className="text-blue-400 font-semibold text-base">{lawyer.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <CardTitle className="text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors duration-200">
                {lawyer.name}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                {lawyer.specialization}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-auto">
              {/* View Profile Button */}
              <Button
                onClick={() => handleViewProfile(lawyer.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 text-sm"
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Section (Optional) */}
      <div className="text-center mt-8">
        <Button 
          variant="outline" 
          className="text-gray-400 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600 hover:text-gray-300 transition-all duration-200"
        >
          Load More Lawyers
        </Button>
      </div>
    </div>
  );
};

export default LawyerConnect;
