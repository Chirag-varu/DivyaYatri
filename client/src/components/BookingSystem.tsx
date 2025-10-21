import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  CreditCard,
  User,
  Plus,
  Minus,
  Loader2,
  QrCode,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { createBooking, getAvailableSlots, type Booking, type CreateBookingData, type BookingSlot } from '@/api/services/bookingService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface BookingFormData {
  slotId: string;
  numberOfPeople: number;
  specialRequests: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
}

interface BookingSystemProps {
  templeId: string;
  templeName: string;
  onBookingComplete: (bookingId: string) => void;
}

export default function BookingSystem({ templeId, templeName, onBookingComplete }: BookingSystemProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'details' | 'payment' | 'confirmation'>('select');
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    slotId: '',
    numberOfPeople: 1,
    specialRequests: '',
    contactInfo: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
    emergencyContact: {
      name: '',
      phone: '',
    },
  });

  // Fetch available slots for the selected date
  const { data: availableSlots = [], isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['availableSlots', templeId, selectedDate],
    queryFn: () => getAvailableSlots(templeId, selectedDate),
    enabled: !!templeId && !!selectedDate,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setCurrentStep('confirmation');
      onBookingComplete(booking._id);
      
      // Invalidate and refetch slots
      queryClient.invalidateQueries({ queryKey: ['availableSlots', templeId] });
      
      toast.success({
        title: 'Booking confirmed!',
        description: 'Your darshan slot has been successfully booked.',
      });
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast.error({
        title: 'Booking failed',
        description: 'Unable to complete your booking. Please try again.',
      });
    }
  });

  // Mock booking slots data - this will be replaced by real API data

  const handleSlotSelect = (slot: BookingSlot) => {
    if (!isAuthenticated) {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to book a slot.',
      });
      return;
    }

    setSelectedSlot(slot);
    setBookingForm(prev => ({ ...prev, slotId: slot._id }));
    setCurrentStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingForm(prev => ({
        ...prev,
        [parent]: {
          ...((typeof prev[parent as keyof BookingFormData] === 'object' && prev[parent as keyof BookingFormData] !== null && !Array.isArray(prev[parent as keyof BookingFormData]))
            ? (prev[parent as keyof BookingFormData] as Record<string, any>)
            : {}),
          [child]: value
        }
      }));
    } else {
      setBookingForm(prev => ({
        ...prev,
        [name]: name === 'numberOfPeople' ? parseInt(value) || 1 : value
      }));
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, bookingForm.numberOfPeople + delta));
    setBookingForm(prev => ({ ...prev, numberOfPeople: newQuantity }));
  };

  const validateBookingForm = () => {
    if (!bookingForm.contactInfo.name.trim()) {
      toast.error({ title: 'Validation Error', description: 'Contact name is required.' });
      return false;
    }
    if (!bookingForm.contactInfo.phone.trim()) {
      toast.error({ title: 'Validation Error', description: 'Contact phone is required.' });
      return false;
    }
    if (!bookingForm.contactInfo.email.trim()) {
      toast.error({ title: 'Validation Error', description: 'Contact email is required.' });
      return false;
    }
    return true;
  };

  const handleBookingSubmit = async () => {
    if (!validateBookingForm() || !selectedSlot) return;

    const bookingData: CreateBookingData = {
      templeId: templeId,
      date: selectedDate,
      timeSlot: selectedSlot.timeSlot.split(' - ')[0], // Use start time
      numberOfVisitors: bookingForm.numberOfPeople,
      specialRequests: bookingForm.specialRequests,
      contactInfo: bookingForm.contactInfo
    };

    createBookingMutation.mutate(bookingData);
  };

  const resetBooking = () => {
    setSelectedSlot(null);
    setConfirmedBooking(null);
    setCurrentStep('select');
    setBookingForm({
      slotId: '',
      numberOfPeople: 1,
      specialRequests: '',
      contactInfo: {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
      },
      emergencyContact: {
        name: '',
        phone: '',
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Sign in required</h3>
          <p className="text-text/70 mb-6">Please sign in to book darshan slots and special services.</p>
          <Button className="  from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Book Your Visit</CardTitle>
          <CardDescription>
            Reserve your spot for {templeName} darshan and special services
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'select', label: 'Select Slot', icon: Calendar },
              { key: 'details', label: 'Booking Details', icon: User },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['select', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'select' && (
        <div className="space-y-6">
          {/* Date Selection */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
              />
            </CardContent>
          </Card>

          {/* Available Slots */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle>Available Slots</CardTitle>
              <CardDescription>
                Choose your preferred time slot for {new Date(selectedDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading available slots...</span>
                  </div>
                ) : slotsError ? (
                  <div className="col-span-full text-center py-8 text-red-600">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    <p>Error loading slots. Please try again.</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Clock className="h-6 w-6 mx-auto mb-2" />
                    <p>No available slots for this date.</p>
                  </div>
                ) : (
                  availableSlots.map((slot) => {
                  const availableSpots = slot.maxCapacity - slot.currentBookings;
                  const isAlmostFull = availableSpots <= 5;
                  
                  return (
                    <Card 
                      key={slot._id} 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        slot.isAvailable 
                          ? 'hover:scale-105 border-2 border-transparent hover:border-primary/30' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">{slot.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.type === 'darshan' 
                                ? 'bg-blue-100 text-blue-700'
                                : slot.type === 'aarti'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-purple-100 text-purple-700'
                            }`}>
                              {slot.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text/70">Available spots:</span>
                            <span className={`font-medium ${
                              isAlmostFull ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {availableSpots} / {slot.maxCapacity}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text/70">Price:</span>
                            <span className="font-medium text-lg">
                              {slot.price === 0 ? 'Free' : `₹${slot.price}`}
                            </span>
                          </div>
                          
                          {isAlmostFull && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>Only {availableSpots} spots left!</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                          <div 
                            className={`h-2 rounded-full ${
                              isAlmostFull ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(slot.currentBookings / slot.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'details' && selectedSlot && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              Please provide your details for the booking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Slot Summary */}
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Selected Slot</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text/70">Date:</span>
                  <span className="ml-2 font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-text/70">Time:</span>
                  <span className="ml-2 font-medium">{selectedSlot.timeSlot}</span>
                </div>
                <div>
                  <span className="text-text/70">Type:</span>
                  <span className="ml-2 font-medium">{selectedSlot.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-text/70">Price:</span>
                  <span className="ml-2 font-medium">
                    {selectedSlot.price === 0 ? 'Free' : `₹${selectedSlot.price}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Number of People */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Number of People
              </label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={bookingForm.numberOfPeople <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {bookingForm.numberOfPeople}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={bookingForm.numberOfPeople >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
                  <Input
                    name="contactInfo.name"
                    value={bookingForm.contactInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Phone Number *</label>
                  <Input
                    name="contactInfo.phone"
                    value={bookingForm.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1">Email Address *</label>
                  <Input
                    name="contactInfo.email"
                    type="email"
                    value={bookingForm.contactInfo.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold">Emergency Contact (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Name</label>
                  <Input
                    name="emergencyContact.name"
                    value={bookingForm.emergencyContact.name}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Phone</label>
                  <Input
                    name="emergencyContact.phone"
                    value={bookingForm.emergencyContact.phone}
                    onChange={handleInputChange}
                    placeholder="Emergency contact phone"
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                name="specialRequests"
                value={bookingForm.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requirements or requests..."
                rows={3}
                className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-3 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300 resize-none"
              />
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-primary">
                  ₹{selectedSlot.price * bookingForm.numberOfPeople}
                </span>
              </div>
              <div className="text-sm text-text/70 mt-1">
                {selectedSlot.price === 0 ? 'Free darshan' : `₹${selectedSlot.price} × ${bookingForm.numberOfPeople} people`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('select')}
                className="flex-1"
              >
                Back to Slots
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep('payment')}
                className="flex-1   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && selectedSlot && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete your booking payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-primary/5 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Booking Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Temple:</span>
                  <span className="font-medium">{templeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedSlot.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span>People:</span>
                  <span className="font-medium">{bookingForm.numberOfPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="font-medium">{bookingForm.contactInfo.name}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{selectedSlot.price * bookingForm.numberOfPeople}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {selectedSlot.price > 0 ? (
              <div className="space-y-4">
                <h4 className="font-semibold">Payment Method</h4>
                <Tabs defaultValue="upi" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upi">UPI</TabsTrigger>
                    <TabsTrigger value="card">Card</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upi" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                        <div className="text-xs text-gray-600">QR Code</div>
                      </div>
                      <p className="text-sm text-text/70">Scan QR code with your UPI app</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="card" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Card Number" className="col-span-2" />
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVV" />
                      <Input placeholder="Cardholder Name" className="col-span-2" />
                    </div>
                  </TabsContent>
                  <TabsContent value="wallet" className="space-y-4">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <div className="w-8 h-8 bg-blue-500 rounded mr-3"></div>
                        Paytm Wallet
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <div className="w-8 h-8 bg-purple-500 rounded mr-3"></div>
                        PhonePe
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
                        Google Pay
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 mb-1">Free Darshan</h4>
                <p className="text-sm text-green-700">No payment required for this booking</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('details')}
                className="flex-1"
              >
                Back to Details
              </Button>
              <Button
                type="button"
                onClick={handleBookingSubmit}
                disabled={createBookingMutation.isPending}
                className="flex-1   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'confirmation' && confirmedBooking && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-text mb-4">Booking Confirmed!</h3>
            <p className="text-text/70 mb-6 max-w-md mx-auto">
              Your darshan slot has been successfully booked. You will receive a confirmation email shortly.
            </p>
            
            {/* QR Code Section */}
            {confirmedBooking.qrCode && (
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                  <img 
                    src={confirmedBooking.qrCode} 
                    alt="Booking QR Code" 
                    className="w-32 h-32 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    <QrCode className="w-4 h-4 inline mr-1" />
                    Show this QR code at the temple
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    if (confirmedBooking.qrCode) {
                      const link = document.createElement('a');
                      link.href = confirmedBooking.qrCode;
                      link.download = `booking-qr-${confirmedBooking._id}.png`;
                      link.click();
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <h4 className="font-semibold mb-3">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temple:</span>
                  <span className="font-medium">{confirmedBooking.temple.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date(confirmedBooking.visitDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{confirmedBooking.timeSlot.start} - {confirmedBooking.timeSlot.end}</span>
                </div>
                <div className="flex justify-between">
                  <span>People:</span>
                  <span className="font-medium">{confirmedBooking.visitors.adults + confirmedBooking.visitors.children + confirmedBooking.visitors.seniors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-medium font-mono text-xs">{confirmedBooking._id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600 capitalize">{confirmedBooking.bookingStatus}</span>
                </div>
                {confirmedBooking.finalAmount > 0 && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Amount Paid:</span>
                    <span className="font-medium">₹{confirmedBooking.finalAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetBooking}
              >
                Book Another Slot
              </Button>
              <Button className="  from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
                View My Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}