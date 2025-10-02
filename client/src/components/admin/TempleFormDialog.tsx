import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Plus, X, Save } from 'lucide-react';
import { toast } from '@/hooks/useToast';

interface Temple {
  id?: string;
  name: string;
  location: string;
  rating?: number;
  reviews?: number;
  status: 'active' | 'pending' | 'suspended';
  addedDate?: string;
  lastUpdated?: string;
  images: string[];
  description: string;
  category: string;
  subcategory: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  email: string;
  website?: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  specialEvents: Array<{
    name: string;
    date: string;
    description: string;
  }>;
  facilities: string[];
  entryFee: number;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verificationNotes?: string;
}

interface TempleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temple?: Temple | null;
  onSave: (temple: Temple) => void;
}

const templeCategories = [
  'Hindu Temple',
  'Buddhist Temple',
  'Jain Temple',
  'Sikh Gurudwara',
  'Islamic Mosque',
  'Christian Church',
  'Other'
];

const facilities = [
  'Parking',
  'Restrooms',
  'Food Court',
  'Gift Shop',
  'Audio Guide',
  'Wheelchair Access',
  'Photography Allowed',
  'Online Booking'
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function TempleFormDialog({ open, onOpenChange, temple, onSave }: TempleFormDialogProps) {
  const [formData, setFormData] = useState<Temple>(() => ({
    id: temple?.id || '',
    name: temple?.name || '',
    location: temple?.location || '',
    description: temple?.description || '',
    category: temple?.category || '',
    subcategory: temple?.subcategory || '',
    address: temple?.address || '',
    city: temple?.city || '',
    state: temple?.state || '',
    pincode: temple?.pincode || '',
    contactNumber: temple?.contactNumber || '',
    email: temple?.email || '',
    website: temple?.website || '',
    status: temple?.status || 'pending',
    images: temple?.images || [],
    openingHours: temple?.openingHours || days.reduce((acc, day) => ({
      ...acc,
      [day]: { open: '06:00', close: '20:00', closed: false }
    }), {}),
    specialEvents: temple?.specialEvents || [],
    facilities: temple?.facilities || [],
    entryFee: temple?.entryFee || 0,
    parkingAvailable: temple?.parkingAvailable || false,
    wheelchairAccessible: temple?.wheelchairAccessible || false,
    verificationStatus: temple?.verificationStatus || 'pending',
    verificationNotes: temple?.verificationNotes || ''
  }));

  const [newEvent, setNewEvent] = useState({ name: '', date: '', description: '' });
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(temple?.facilities || []);

  const handleInputChange = (field: keyof Temple, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const addSpecialEvent = () => {
    if (newEvent.name && newEvent.date) {
      setFormData(prev => ({
        ...prev,
        specialEvents: [...prev.specialEvents, { ...newEvent }]
      }));
      setNewEvent({ name: '', date: '', description: '' });
    }
  };

  const removeSpecialEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialEvents: prev.specialEvents.filter((_, i) => i !== index)
    }));
  };

  const toggleFacility = (facility: string) => {
    const newFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter(f => f !== facility)
      : [...selectedFacilities, facility];
    setSelectedFacilities(newFacilities);
    setFormData(prev => ({ ...prev, facilities: newFacilities }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.address) {
      toast.error({
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast.success({
      title: "Temple Saved",
      description: `Temple "${formData.name}" has been saved successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {temple ? 'Edit Temple' : 'Add New Temple'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Temple Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter temple name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  {templeCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Enter temple description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'pending' | 'suspended')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Contact number"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {days.map(day => (
                  <div key={day} className="flex items-center gap-2">
                    <div className="w-20 text-sm font-medium capitalize">{day}</div>
                    <input
                      type="checkbox"
                      checked={!formData.openingHours[day]?.closed}
                      onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                      className="rounded"
                    />
                    {!formData.openingHours[day]?.closed && (
                      <>
                        <Input
                          type="time"
                          value={formData.openingHours[day]?.open || '06:00'}
                          onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                          className="w-24"
                        />
                        <span className="text-sm">to</span>
                        <Input
                          type="time"
                          value={formData.openingHours[day]?.close || '20:00'}
                          onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                          className="w-24"
                        />
                      </>
                    )}
                    {formData.openingHours[day]?.closed && (
                      <span className="text-sm text-red-600">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facilities & Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facilities & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Available Facilities</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {facilities.map(facility => (
                    <div key={facility} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFacilities.includes(facility)}
                        onChange={() => toggleFacility(facility)}
                        className="rounded"
                      />
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => handleInputChange('entryFee', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.parkingAvailable}
                    onChange={(e) => handleInputChange('parkingAvailable', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Parking Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.wheelchairAccessible}
                    onChange={(e) => handleInputChange('wheelchairAccessible', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Wheelchair Accessible</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Events */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Special Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    value={newEvent.name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Event name"
                  />
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Input
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                  />
                  <Button onClick={addSpecialEvent} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.specialEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.date} - {event.description}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecialEvent(index)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Verification Status:</Label>
                <Badge variant={
                  formData.verificationStatus === 'verified' ? 'success' :
                  formData.verificationStatus === 'pending' ? 'warning' :
                  'destructive'
                }>
                  {formData.verificationStatus}
                </Badge>
              </div>

              <div>
                <Label htmlFor="verificationNotes">Verification Notes</Label>
                <Textarea
                  id="verificationNotes"
                  value={formData.verificationNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('verificationNotes', e.target.value)}
                  placeholder="Add verification notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Temple
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}