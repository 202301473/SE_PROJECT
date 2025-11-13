import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/Card";

const lawyers = [
  {
    id: 1,
    name: 'John Doe',
    specialty: 'Corporate Law',
    avatar: 'JD',
  },
  {
    id: 2,
    name: 'Jane Smith',
    specialty: 'Family Law',
    avatar: 'JS',
  },
  {
    id: 3,
    name: 'Peter Jones',
    specialty: 'Criminal Defense',
    avatar: 'PJ',
  },
  {
    id: 4,
    name: 'Sarah Lee',
    specialty: 'Intellectual Property',
    avatar: 'SL',
  },
  // Add more lawyers as needed
];

const Lawyers = () => {
  return (
    <div className="container mx-auto py-10 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
          <span className="text-blue-400 text-xs font-medium">Legal Team</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Our Lawyers
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Meet our team of experienced legal professionals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lawyers.map((lawyer, index) => (
          <Link to={`/lawyer-profile/${lawyer.id}`} key={lawyer.id}>
            <Card className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 transition-all duration-200 group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mb-3 border border-blue-500/30 group-hover:border-blue-500/50 transition-all duration-200">
                  {lawyer.avatar}
                </div>
                <CardTitle className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">{lawyer.name}</CardTitle>
                <CardDescription className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">{lawyer.specialty}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Lawyers;
