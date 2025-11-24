import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/Card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/Input";
import { BadgeCheck, Clock, X, Search, ShieldAlert, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/Tabs";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const AdminLawyerVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState({});

  useEffect(() => {
    if (!user) return;
    
    // Check if user is admin
    if (!user.is_superuser && user.role !== 'admin') {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    loadLawyers();
  }, [user, navigate, activeTab]);

  useEffect(() => {
    filterLawyers();
  }, [searchTerm, lawyers]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const status = activeTab === "all" ? "all" : activeTab;
      const response = await axios.get(`api/lawyer/admin/pending/?status=${status}`);
      setLawyers(response.data);
      setFilteredLawyers(response.data);
    } catch (err) {
      console.error("Failed to load lawyers:", err);
      toast.error(err.response?.data?.error || "Unable to load lawyers.");
    } finally {
      setLoading(false);
    }
  };

  const filterLawyers = () => {
    if (!searchTerm.trim()) {
      setFilteredLawyers(lawyers);
      return;
    }

    const filtered = lawyers.filter((lawyer) => {
      const search = searchTerm.toLowerCase();
      const email = lawyer.user?.email?.toLowerCase() || "";
      const name = lawyer.user?.name?.toLowerCase() || "";
      const username = lawyer.user?.username?.toLowerCase() || "";
      const license = lawyer.license_number?.toLowerCase() || "";
      const barCouncil = lawyer.bar_council_id?.toLowerCase() || "";

      return (
        email.includes(search) ||
        name.includes(search) ||
        username.includes(search) ||
        license.includes(search) ||
        barCouncil.includes(search)
      );
    });

    setFilteredLawyers(filtered);
  };

  const handleVerify = async (lawyerId, status) => {
    try {
      setVerifyingId(lawyerId);
      const notes = verificationNotes[lawyerId] || "";
      
      const response = await axios.patch(`api/lawyer/admin/verify/${lawyerId}/`, {
        status,
        notes,
      });

      toast.success(response.data.message || `Lawyer ${status} successfully.`);
      
      // Clear notes for this lawyer
      setVerificationNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[lawyerId];
        return newNotes;
      });

      // Reload lawyers
      await loadLawyers();
    } catch (err) {
      console.error("Failed to verify lawyer:", err);
      toast.error(err.response?.data?.error || "Unable to verify lawyer.");
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    lawyers.forEach((lawyer) => {
      const status = lawyer.verification_status || "pending";
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="container mx-auto py-10 animate-fade-in">
        <div className="text-center text-gray-400">Loading lawyers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Lawyer Verification</h1>
          <p className="text-muted-foreground">Review and verify lawyer applications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm border border-yellow-500/30">
              Pending: {statusCounts.pending}
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
              Approved: {statusCounts.approved}
            </div>
            <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30">
              Rejected: {statusCounts.rejected}
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by email, name, license, or bar council ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border/50 text-foreground"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({statusCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({statusCounts.rejected})
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredLawyers.length === 0 ? (
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No {activeTab === "all" ? "" : activeTab} lawyers found.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLawyers.map((lawyer) => {
              const StatusIcon = statusIcons[lawyer.verification_status] || Clock;
              const isVerifying = verifyingId === lawyer.user?.id;

              return (
                <Card
                  key={lawyer.user?.id || lawyer.id}
                  className="bg-card border-border backdrop-blur-sm hover:border-primary/30 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center text-lg font-bold border border-primary/30">
                            {(lawyer.user?.name || lawyer.user?.username || "L")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-xl text-foreground">
                              {lawyer.user?.name || lawyer.user?.username || "Unknown"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {lawyer.user?.email}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5" />
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border ${statusColors[lawyer.verification_status] || statusColors.pending}`}
                        >
                          {lawyer.verification_status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">License Number</p>
                        <p className="text-foreground font-medium">{lawyer.license_number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Bar Council ID</p>
                        <p className="text-foreground font-medium">{lawyer.bar_council_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Experience</p>
                        <p className="text-foreground font-medium">
                          {lawyer.experience_years || 0} years
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Specializations</p>
                        <p className="text-foreground font-medium">
                          {lawyer.specializations?.length > 0
                            ? lawyer.specializations.join(", ")
                            : "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Education</p>
                        <p className="text-foreground font-medium">{lawyer.education || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Law Firm</p>
                        <p className="text-foreground font-medium">{lawyer.law_firm || "N/A"}</p>
                      </div>
                    </div>

                    {lawyer.bio && (
                      <div>
                        <p className="text-muted-foreground mb-1 text-sm">Bio</p>
                        <p className="text-foreground text-sm">{lawyer.bio}</p>
                      </div>
                    )}

                    {lawyer.verification_notes && (
                      <div className="p-3 bg-muted/50 border border-border/30 rounded-lg">
                        <p className="text-muted-foreground mb-1 text-sm font-semibold">Verification Notes</p>
                        <p className="text-foreground text-sm">{lawyer.verification_notes}</p>
                      </div>
                    )}

                    {lawyer.verification_status === "pending" && (
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Verification Notes (optional)
                          </label>
                          <Input
                            type="text"
                            placeholder="Add notes about this verification..."
                            value={verificationNotes[lawyer.user?.id] || ""}
                            onChange={(e) =>
                              setVerificationNotes((prev) => ({
                                ...prev,
                                [lawyer.user?.id]: e.target.value,
                              }))
                            }
                            className="bg-input border-border/50 text-foreground"
                            disabled={isVerifying}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleVerify(lawyer.user?.id, "approved")}
                            disabled={isVerifying}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleVerify(lawyer.user?.id, "rejected")}
                            disabled={isVerifying}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {lawyer.verification_status !== "pending" && (
                      <div className="pt-4 border-t border-border/50">
                        <Button
                          onClick={() => handleVerify(lawyer.user?.id, "pending")}
                          disabled={isVerifying}
                          variant="outline"
                          className="w-full"
                        >
                          Reset to Pending
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLawyerVerification;

