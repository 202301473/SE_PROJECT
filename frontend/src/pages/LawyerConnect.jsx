import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/Card";
import { Button } from "@/Components/ui/Button";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LawyerConnect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get('api/auth/lawyers/');
        setLawyers(response.data || []);
      } catch (err) {
        console.error('Failed to load lawyers:', err);
        setError('Failed to load lawyers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const handleConnect = async (lawyer) => {
    if (!lawyer?.user?.id) return;

    const message = window.prompt('Add a short note for the lawyer (optional):', '');
    const preferredContact = window.prompt(
      'Provide the best way for the lawyer to reach you (email or phone):',
      user?.email || ''
    );
    const preferredTimeInput = window.prompt(
      'Preferred consultation time (YYYY-MM-DD HH:MM in your timezone):',
      ''
    );

    let preferredTimeIso = null;
    if (preferredTimeInput) {
      const normalizedInput = preferredTimeInput.trim().replace(' ', 'T');
      const parsedDate = new Date(normalizedInput);
      if (Number.isNaN(parsedDate.getTime())) {
        toast.error('Please provide a valid consultation time in YYYY-MM-DD HH:MM format.');
        return;
      }
      preferredTimeIso = parsedDate.toISOString();
    }

    try {
      const response = await axios.post(`api/auth/lawyers/${lawyer.user.id}/connect/`, {
        message: message || '',
        preferred_contact_method: preferredContact?.includes('@') ? 'email' : 'phone',
        preferred_contact_value: preferredContact || user?.email || '',
        preferred_time: preferredTimeIso,
      });

      const meetingLink = response.data?.meeting_link || response.data?.request?.meeting_link;
      toast.success(
        meetingLink
          ? `Connection request sent! Google Meet link: ${meetingLink}`
          : response.data?.message || 'Connection request sent!'
      );
    } catch (err) {
      console.error('Failed to connect with lawyer:', err);
      toast.error(err.response?.data?.error || 'Unable to send connection request.');
    }
  };

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
      {loading && (
        <div className="text-center text-gray-400">Loading vetted lawyers...</div>
      )}
      {error && (
        <div className="text-center text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!loading && !error && lawyers.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No verified lawyers are available yet. Please check back soon.
          </div>
        )}
        {lawyers.map((lawyer, index) => (
          <Card
            key={lawyer.id || lawyer.user?.id || index}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 transition-all duration-200 p-5 flex flex-col group animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="flex flex-col items-center text-center p-0 mb-4">
              {/* Profile Photo Placeholder */}
              <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-3 group-hover:border-blue-500/50 transition-all duration-200">
                <span className="text-blue-400 font-semibold text-base">
                  {lawyer?.user?.name
                    ? lawyer.user.name.split(' ').map(n => n[0]).join('')
                    : lawyer?.user?.username?.slice(0, 2)?.toUpperCase() || 'L'}
                </span>
              </div>
              <CardTitle className="text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors duration-200">
                {lawyer?.user?.name || lawyer?.user?.username || 'Verified Lawyer'}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                {Array.isArray(lawyer.specializations) && lawyer.specializations.length > 0
                  ? lawyer.specializations.join(', ')
                  : 'General Practice'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-auto space-y-3 text-sm text-gray-300">
              <div className="flex flex-col gap-1">
                {typeof lawyer.experience_years === 'number' && (
                  <p>
                    <span className="text-gray-400">Experience:</span>{' '}
                    {lawyer.experience_years} {lawyer.experience_years === 1 ? 'year' : 'years'}
                  </p>
                )}
                {lawyer.consultation_fee && (
                  <p>
                    <span className="text-gray-400">Consultation:</span> {lawyer.consultation_fee}
                  </p>
                )}
                {lawyer.education && (
                  <p>
                    <span className="text-gray-400">Education:</span> {lawyer.education}
                  </p>
                )}
              </div>
              {/* View Profile Button */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleViewProfile(lawyer?.user?.id || lawyer.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 text-sm"
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConnect(lawyer)}
                  className="w-full text-blue-400 border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 transition-colors duration-200 text-sm"
                >
                  Connect
                </Button>
              </div>
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
