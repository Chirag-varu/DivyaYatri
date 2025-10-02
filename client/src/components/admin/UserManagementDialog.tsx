import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Activity,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/useToast';

interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'banned';
  reviewsCount: number;
  lastActivity: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verificationDocuments?: string[];
  personalInfo?: {
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    privacyLevel: 'public' | 'private' | 'friends';
  };
  activityLog?: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
  warningsCount: number;
  suspensionHistory?: Array<{
    reason: string;
    date: string;
    duration: string;
    status: 'active' | 'completed';
  }>;
  communicationHistory?: Array<{
    type: 'email' | 'notification' | 'warning';
    subject: string;
    date: string;
    status: 'sent' | 'delivered' | 'read';
  }>;
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
  onSuspend?: (userId: string, reason: string, duration: string) => void;
  onBan?: (userId: string, reason: string) => void;
  onSendMessage?: (userId: string, message: string, type: 'email' | 'notification') => void;
}

export default function UserManagementDialog({ 
  open, 
  onOpenChange, 
  user, 
  onSave,
  onSuspend,
  onBan,
  onSendMessage
}: UserManagementDialogProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<User>(() => ({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    joinDate: user?.joinDate || new Date().toISOString(),
    status: user?.status || 'active',
    reviewsCount: user?.reviewsCount || 0,
    lastActivity: user?.lastActivity || new Date().toISOString(),
    avatar: user?.avatar || '',
    role: user?.role || 'user',
    verificationStatus: user?.verificationStatus || 'pending',
    verificationDocuments: user?.verificationDocuments || [],
    personalInfo: user?.personalInfo || {
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    preferences: user?.preferences || {
      notifications: true,
      emailUpdates: true,
      privacyLevel: 'public'
    },
    activityLog: user?.activityLog || [],
    warningsCount: user?.warningsCount || 0,
    suspensionHistory: user?.suspensionHistory || [],
    communicationHistory: user?.communicationHistory || []
  }));

  const [suspensionForm, setSuspensionForm] = useState({
    reason: '',
    duration: '7'
  });

  const [banForm, setBanForm] = useState({
    reason: ''
  });

  const [messageForm, setMessageForm] = useState({
    type: 'email' as 'email' | 'notification',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: keyof User, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error({
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast.success({
      title: "User Updated",
      description: `User "${formData.name}" has been updated successfully.`,
    });
  };

  const handleSuspendUser = () => {
    if (!suspensionForm.reason) {
      toast.error({
        title: "Validation Error",
        description: "Please provide a reason for suspension.",
      });
      return;
    }

    if (user?.id && onSuspend) {
      onSuspend(user.id, suspensionForm.reason, suspensionForm.duration);
      setSuspensionForm({ reason: '', duration: '7' });
      toast.success({
        title: "User Suspended",
        description: `User has been suspended for ${suspensionForm.duration} days.`,
      });
    }
  };

  const handleBanUser = () => {
    if (!banForm.reason) {
      toast.error({
        title: "Validation Error", 
        description: "Please provide a reason for banning.",
      });
      return;
    }

    if (user?.id && onBan) {
      onBan(user.id, banForm.reason);
      setBanForm({ reason: '' });
      toast.success({
        title: "User Banned",
        description: "User has been permanently banned.",
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.message) {
      toast.error({
        title: "Validation Error",
        description: "Please fill in subject and message.",
      });
      return;
    }

    if (user?.id && onSendMessage) {
      onSendMessage(user.id, `${messageForm.subject}: ${messageForm.message}`, messageForm.type);
      setMessageForm({ type: 'email', subject: '', message: '' });
      toast.success({
        title: "Message Sent",
        description: `${messageForm.type} sent successfully.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? `Manage User: ${user.name}` : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value as 'user' | 'admin' | 'moderator')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'suspended' | 'banned')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.personalInfo?.dateOfBirth || ''}
                      onChange={(e) => handleNestedInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={formData.personalInfo?.gender || ''}
                      onChange={(e) => handleNestedInputChange('personalInfo', 'gender', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.personalInfo?.address || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNestedInputChange('personalInfo', 'address', e.target.value)}
                      placeholder="Enter full address"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.personalInfo?.city || ''}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.personalInfo?.state || ''}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.personalInfo?.pincode || ''}
                      onChange={(e) => handleNestedInputChange('personalInfo', 'pincode', e.target.value)}
                      placeholder="Pincode"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.reviewsCount}</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{formData.warningsCount}</div>
                      <div className="text-sm text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {new Date(formData.joinDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Member Since</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Date(formData.lastActivity).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Last Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Current Status:</Label>
                  <Badge variant={
                    formData.verificationStatus === 'verified' ? 'success' :
                    formData.verificationStatus === 'pending' ? 'warning' :
                    'destructive'
                  }>
                    {formData.verificationStatus}
                  </Badge>
                </div>

                <div>
                  <Label>Update Verification Status</Label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) => handleInputChange('verificationStatus', e.target.value as 'verified' | 'pending' | 'rejected')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {formData.verificationDocuments && formData.verificationDocuments.length > 0 && (
                  <div>
                    <Label>Verification Documents</Label>
                    <div className="space-y-2 mt-2">
                      {formData.verificationDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-secondary/10 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.activityLog && formData.activityLog.length > 0 ? (
                    formData.activityLog.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No activity recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {formData.suspensionHistory && formData.suspensionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    Suspension History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.suspensionHistory.map((suspension, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{suspension.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {suspension.date} - {suspension.duration} ({suspension.status})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Suspend User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Suspend User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="suspensionReason">Reason for Suspension</Label>
                    <Textarea
                      id="suspensionReason"
                      value={suspensionForm.reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuspensionForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Enter reason for suspension..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="suspensionDuration">Duration (days)</Label>
                    <select
                      id="suspensionDuration"
                      value={suspensionForm.duration}
                      onChange={(e) => setSuspensionForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleSuspendUser}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={formData.status === 'suspended'}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                </CardContent>
              </Card>

              {/* Ban User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Ban className="h-5 w-5" />
                    Ban User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="banReason">Reason for Ban</Label>
                    <Textarea
                      id="banReason"
                      value={banForm.reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Enter reason for permanent ban..."
                      rows={5}
                    />
                  </div>
                  <Button 
                    onClick={handleBanUser}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={formData.status === 'banned'}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User Permanently
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send Message to User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Message Type</Label>
                  <select
                    value={messageForm.type}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value as 'email' | 'notification' }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="email">Email</option>
                    <option value="notification">In-app Notification</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="messageSubject">Subject</Label>
                  <Input
                    id="messageSubject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <Label htmlFor="messageContent">Message</Label>
                  <Textarea
                    id="messageContent"
                    value={messageForm.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message..."
                    rows={5}
                  />
                </div>

                <Button onClick={handleSendMessage} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {formData.communicationHistory && formData.communicationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.communicationHistory.map((comm, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{comm.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {comm.type} - {comm.date}
                          </p>
                        </div>
                        <Badge variant={
                          comm.status === 'read' ? 'success' :
                          comm.status === 'delivered' ? 'warning' :
                          'secondary'
                        }>
                          {comm.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white">
            <Settings className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}