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
  Calendar,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  CreditCard
} from 'lucide-react';
import { toast } from '@/hooks/useToast';

interface Booking {
  id?: string;
  templeName: string;
  templeId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: string;
  timeSlot: string;
  visitors: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  bookingDate: string;
  lastUpdated: string;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
  refundDate?: string;
  capacity?: {
    total: number;
    booked: number;
    available: number;
  };
  bookingHistory?: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
    notes?: string;
  }>;
}

interface BookingManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  onSave: (booking: Booking) => void;
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string, reason: string) => void;
  onRefund?: (bookingId: string, amount: number, reason: string) => void;
  onComplete?: (bookingId: string) => void;
}

export default function BookingManagementDialog({
  open,
  onOpenChange,
  booking,
  onSave,
  onConfirm,
  onCancel,
  onRefund,
  onComplete
}: BookingManagementDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<Booking>(() => ({
    id: booking?.id || '',
    templeName: booking?.templeName || '',
    templeId: booking?.templeId || '',
    userName: booking?.userName || '',
    userEmail: booking?.userEmail || '',
    userPhone: booking?.userPhone || '',
    date: booking?.date || '',
    timeSlot: booking?.timeSlot || '',
    visitors: booking?.visitors || 1,
    amount: booking?.amount || 0,
    status: booking?.status || 'pending',
    paymentStatus: booking?.paymentStatus || 'pending',
    paymentMethod: booking?.paymentMethod || '',
    transactionId: booking?.transactionId || '',
    bookingDate: booking?.bookingDate || new Date().toISOString(),
    lastUpdated: booking?.lastUpdated || new Date().toISOString(),
    specialRequests: booking?.specialRequests || '',
    cancellationReason: booking?.cancellationReason || '',
    refundAmount: booking?.refundAmount || 0,
    refundReason: booking?.refundReason || '',
    refundDate: booking?.refundDate || '',
    capacity: booking?.capacity || {
      total: 100,
      booked: 0,
      available: 100
    },
    bookingHistory: booking?.bookingHistory || []
  }));

  const [cancellationForm, setCancellationForm] = useState({
    reason: ''
  });

  const [refundForm, setRefundForm] = useState({
    amount: booking?.amount || 0,
    reason: ''
  });

  const handleInputChange = (field: keyof Booking, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.templeName || !formData.userName || !formData.date) {
      toast.error({
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast.success({
      title: "Booking Updated",
      description: `Booking for ${formData.templeName} has been updated successfully.`,
    });
  };

  const handleConfirmBooking = () => {
    if (booking?.id && onConfirm) {
      onConfirm(booking.id);
      toast.success({
        title: "Booking Confirmed",
        description: "The booking has been confirmed successfully.",
      });
    }
  };

  const handleCancelBooking = () => {
    if (!cancellationForm.reason) {
      toast.error({
        title: "Validation Error",
        description: "Please provide a reason for cancellation.",
      });
      return;
    }

    if (booking?.id && onCancel) {
      onCancel(booking.id, cancellationForm.reason);
      setCancellationForm({ reason: '' });
      toast.success({
        title: "Booking Cancelled",
        description: "The booking has been cancelled successfully.",
      });
    }
  };

  const handleProcessRefund = () => {
    if (!refundForm.reason || refundForm.amount <= 0) {
      toast.error({
        title: "Validation Error",
        description: "Please provide refund amount and reason.",
      });
      return;
    }

    if (booking?.id && onRefund) {
      onRefund(booking.id, refundForm.amount, refundForm.reason);
      setRefundForm({ amount: 0, reason: '' });
      toast.success({
        title: "Refund Processed",
        description: `Refund of ₹${refundForm.amount} has been processed.`,
      });
    }
  };

  const handleCompleteBooking = () => {
    if (booking?.id && onComplete) {
      onComplete(booking.id);
      toast.success({
        title: "Booking Completed",
        description: "The booking has been marked as completed.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {booking ? `Manage Booking: ${booking.templeName}` : 'New Booking'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="templeName">Temple Name *</Label>
                    <Input
                      id="templeName"
                      value={formData.templeName}
                      onChange={(e) => handleInputChange('templeName', e.target.value)}
                      placeholder="Enter temple name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeSlot">Time Slot *</Label>
                      <Input
                        id="timeSlot"
                        value={formData.timeSlot}
                        onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                        placeholder="e.g., 10:00 AM - 11:00 AM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="visitors">Number of Visitors</Label>
                      <Input
                        id="visitors"
                        type="number"
                        min="1"
                        value={formData.visitors}
                        onChange={(e) => handleInputChange('visitors', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Booking Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as any)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Any special requests or notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="userName">User Name *</Label>
                    <Input
                      id="userName"
                      value={formData.userName}
                      onChange={(e) => handleInputChange('userName', e.target.value)}
                      placeholder="Enter user name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userEmail">Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => handleInputChange('userEmail', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userPhone">Phone Number</Label>
                    <Input
                      id="userPhone"
                      value={formData.userPhone || ''}
                      onChange={(e) => handleInputChange('userPhone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Contact Actions</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status Overview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Badge variant={getStatusColor(formData.status)} className="mb-2">
                        {formData.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">Booking Status</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={getStatusColor(formData.paymentStatus)} className="mb-2">
                        {formData.paymentStatus}
                      </Badge>
                      <div className="text-sm text-muted-foreground">Payment Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {new Date(formData.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Booked On</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        ₹{formData.amount}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <select
                      id="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={(e) => handleInputChange('paymentStatus', e.target.value as any)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Input
                      id="paymentMethod"
                      value={formData.paymentMethod || ''}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      placeholder="e.g., Credit Card, UPI, Cash"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      value={formData.transactionId || ''}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="refundAmount">Refund Amount (₹)</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      min="0"
                      value={formData.refundAmount || 0}
                      onChange={(e) => handleInputChange('refundAmount', Number(e.target.value))}
                    />
                  </div>
                </div>

                {formData.refundDate && (
                  <div>
                    <Label>Refund Information</Label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Refund Date:</strong> {new Date(formData.refundDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <strong>Refund Reason:</strong> {formData.refundReason}
                      </p>
                      <p className="text-sm">
                        <strong>Refund Amount:</strong> ₹{formData.refundAmount}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacity Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.capacity?.total || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formData.capacity?.booked || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Booked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formData.capacity?.available || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((formData.capacity?.booked || 0) / (formData.capacity?.total || 1)) * 100}%` 
                    }}
                  ></div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(((formData.capacity?.booked || 0) / (formData.capacity?.total || 1)) * 100)}% Capacity Utilized
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Booking Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleConfirmBooking}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={formData.status === 'confirmed'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>

                  <Button 
                    onClick={handleCompleteBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={formData.status === 'completed'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                </CardContent>
              </Card>

              {/* Cancellation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Cancel Booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cancellationReason">Cancellation Reason</Label>
                    <Textarea
                      id="cancellationReason"
                      value={cancellationForm.reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancellationForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Enter reason for cancellation..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleCancelBooking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={formData.status === 'cancelled'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                </CardContent>
              </Card>

              {/* Refund */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <RefreshCw className="h-5 w-5" />
                    Process Refund
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="refundAmountForm">Refund Amount (₹)</Label>
                      <Input
                        id="refundAmountForm"
                        type="number"
                        min="0"
                        max={formData.amount}
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        placeholder="Enter refund amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refundReasonForm">Refund Reason</Label>
                      <Input
                        id="refundReasonForm"
                        value={refundForm.reason}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Enter refund reason"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleProcessRefund}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={formData.paymentStatus === 'refunded'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Booking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.bookingHistory && formData.bookingHistory.length > 0 ? (
                    formData.bookingHistory.map((history, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{history.action}</p>
                          <p className="text-xs text-muted-foreground">by {history.performedBy}</p>
                          <p className="text-xs text-muted-foreground mt-1">{history.timestamp}</p>
                          {history.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No booking history available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}