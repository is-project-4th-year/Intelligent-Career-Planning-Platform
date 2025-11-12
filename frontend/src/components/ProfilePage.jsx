import { useState, useEffect } from "react";
import api from "../api/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Edit2,
  Save,
  Trash2,
  Plus,
  Award,
  X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [user, setUser] = useState(null);
const [userDetails, setUserDetails] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
});

  const [profile, setProfile] = useState({
    bio: "",
    education: "",
    institution: "",
  });

  const EXPERIENCE_TYPES = [
    "Extracurricular",
    "Internship",
    "Project",
    "Leadership",
    "Research",
    "Industry",
  ];

const initialExperienceForm = {
  type: "",
  title: "",
  organization: "",
  description: "",
  start_date: "",
  end_date: "",
};

// Experience Modal
const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
const [experienceForm, setExperienceForm] = useState(initialExperienceForm);

  // ✅ Load user, profile, assessment, experiences
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    setUserDetails({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
    });
      fetchProfile();
      fetchAssessment();
      fetchExperiences();
    }
  }, []);

useEffect(() => {
  if (!isExperienceModalOpen) return;

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setIsExperienceModalOpen(false);
    }
  };

  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, [isExperienceModalOpen]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("profile/");
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchAssessment = async () => {
    try {
      const res = await api.get("assessment/");
      setAssessment(res.data);
    } catch (err) {
      console.error("Error fetching assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiences = async () => {
    try {
      const res = await api.get("assessment/experience/");
      setExperiences(res.data);
    } catch (err) {
      console.error("Error fetching experiences:", err);
    }
  };

  // ✅ Save profile updates
  const handleSaveProfile = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        api.put("profile/update/", userDetails),
        api.put("profile/", profile),
      ]);

      const updatedUser = {
        ...(user || {}),
        ...userRes.data,
      };

      setUser(updatedUser);
      setUserDetails({
        first_name: userRes.data.first_name || "",
        last_name: userRes.data.last_name || "",
        email: userRes.data.email || "",
        phone: userRes.data.phone || "",
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfile(profileRes.data);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const openAddExperienceModal = () => {
    setEditingExperience(null);
    setExperienceForm(initialExperienceForm);
    setIsExperienceModalOpen(true);
  };

  const closeExperienceModal = () => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
    setExperienceForm(initialExperienceForm);
  };

  // ✅ Add new experience
  const handleAddExperience = async () => {
    if (!experienceForm.title || !experienceForm.type) {
      alert("Please fill at least the Title and Type.");
      return;
    }
    try {
      await api.post("assessment/experience/", experienceForm);
      await fetchExperiences();
      closeExperienceModal();
      alert("Experience added successfully!");
    } catch (err) {
      console.error("Error adding experience:", err);
      alert("Failed to add experience.");
    }
  };

  // ✅ Edit existing experience
  const handleEditExperience = (exp) => {
    setEditingExperience(exp);
    setExperienceForm({
      type: exp.type || "",
      title: exp.title || "",
      organization: exp.organization || "",
      description: exp.description || "",
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
    });
    setIsExperienceModalOpen(true);
  };

  const handleUpdateExperience = async () => {
    if (!editingExperience) return;
    try {
      await api.put(`assessment/experience/${editingExperience.id}/`, experienceForm);
      await fetchExperiences();
      closeExperienceModal();
      alert("Experience updated successfully!");
    } catch (err) {
      console.error("Error updating experience:", err);
      alert("Failed to update experience.");
    }
  };

  // ✅ Delete experience
  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await api.delete(`assessment/experience/${id}/delete/`);
      await fetchExperiences();
    } catch (err) {
      console.error("Error deleting experience:", err);
      alert("Failed to delete experience.");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information, experiences, and career journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                    <span className="text-4xl text-white">
                      {(userDetails.first_name || user?.first_name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <CardTitle>
                  {(userDetails.first_name || user?.first_name || "").trim()}{" "}
                  {(userDetails.last_name || user?.last_name || "").trim()}
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{user?.role}</Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3 text-left">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={userDetails.first_name}
                        onChange={(e) =>
                          setUserDetails((prev) => ({ ...prev, first_name: e.target.value }))
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={userDetails.last_name}
                        onChange={(e) =>
                          setUserDetails((prev) => ({ ...prev, last_name: e.target.value }))
                        }
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-address">Email</Label>
                      <Input
                        id="email-address"
                        type="email"
                        value={userDetails.email}
                        onChange={(e) =>
                          setUserDetails((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone-number">Phone</Label>
                      <Input
                        id="phone-number"
                        value={userDetails.phone || ""}
                        onChange={(e) =>
                          setUserDetails((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{userDetails.email || user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{assessment?.field || "Field not set"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{assessment?.recommended_career || "No recommendation yet"}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Assessment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Field:</strong> {assessment?.field || "N/A"}</p>
                <p><strong>GPA:</strong> {assessment?.gpa || "N/A"}</p>
                <p><strong>Recommended Career:</strong> {assessment?.recommended_career || "Not available"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profile.bio || "Tell us about yourself..."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      placeholder="Education level (e.g. BSc Computer Science)"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    />
                    <Input
                      placeholder="Institution"
                      value={profile.institution}
                      onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    {profile.education && profile.institution
                      ? `${profile.education} at ${profile.institution}`
                      : "No education details yet."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Experiences */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Experiences</CardTitle>
                <Button size="sm" onClick={openAddExperienceModal}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {experiences.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No experiences yet.</p>
                ) : (
                  experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border rounded-lg p-3 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.organization || "—"} | {exp.type}
                        </p>
                        <p className="text-xs mt-1">
                          {exp.start_date} – {exp.end_date || "Present"}
                        </p>
                        {exp.description && (
                          <p className="text-sm mt-1">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditExperience(exp)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {isExperienceModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                onClick={closeExperienceModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="experience-modal-title"
              >
                <div
                  className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="Close experience modal"
                    className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={closeExperienceModal}
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <h2 id="experience-modal-title" className="text-xl font-semibold">
                    {editingExperience ? "Edit Experience" : "Add Experience"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Provide your project, internship, or leadership details.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="experience-type">Type</Label>
                      <Select
                        onValueChange={(value) =>
                          setExperienceForm((prev) => ({ ...prev, type: value }))
                        }
                        value={experienceForm.type}
                      >
                        <SelectTrigger id="experience-type">
                          <SelectValue placeholder="Select experience type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience-title">Title</Label>
                      <Input
                        id="experience-title"
                        value={experienceForm.title}
                        onChange={(e) =>
                          setExperienceForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="e.g., Software Engineering Intern"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience-organization">Organization</Label>
                      <Input
                        id="experience-organization"
                        value={experienceForm.organization}
                        onChange={(e) =>
                          setExperienceForm((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        placeholder="e.g., Safaricom PLC"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience-description">Description</Label>
                      <Textarea
                        id="experience-description"
                        value={experienceForm.description}
                        onChange={(e) =>
                          setExperienceForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your work or project..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="experience-start-date">Start Date</Label>
                        <Input
                          type="date"
                          id="experience-start-date"
                          value={experienceForm.start_date}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              start_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="experience-end-date">End Date</Label>
                        <Input
                          type="date"
                          id="experience-end-date"
                          value={experienceForm.end_date}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={closeExperienceModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={
                        editingExperience ? handleUpdateExperience : handleAddExperience
                      }
                    >
                      {editingExperience ? "Save Changes" : "Add Experience"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" /> Skill Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(assessment || {})
                  .filter(([key]) => key.endsWith("_skills"))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {key.replace(/_/g, " ").replace("skills", "").trim()}
                        </span>
                        <span>{value}/5</span>
                      </div>
                      <Progress value={(value / 5) * 100} />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
