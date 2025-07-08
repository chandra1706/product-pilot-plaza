
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { User, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(addressData);
      setAddressData({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      });
      toast({
        title: "Address added",
        description: "Your address has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add address",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    
    try {
      await updateAddress(editingAddress.id, addressData);
      setEditingAddress(null);
      setAddressData({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      });
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditingAddress = (address: any) => {
    setEditingAddress(address);
    setAddressData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and addresses</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="addresses">My Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and account settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button type="submit">Save Changes</Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false);
                              setProfileData({
                                name: user?.name || '',
                                email: user?.email || '',
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">My Addresses</h2>
                    <p className="text-muted-foreground">Manage your shipping addresses</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                          Add a new shipping address to your account.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={addressData.street}
                            onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={addressData.city}
                              onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={addressData.state}
                              onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              value={addressData.zipCode}
                              onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={addressData.country}
                              onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Add Address</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <Card key={address.id} className={address.isDefault ? 'ring-2 ring-primary' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">Address</CardTitle>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{address.street}</p>
                        <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        
                        <div className="flex gap-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startEditingAddress(address)}
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Address</DialogTitle>
                                <DialogDescription>
                                  Update your shipping address information.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleUpdateAddress} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-street">Street Address</Label>
                                  <Input
                                    id="edit-street"
                                    value={addressData.street}
                                    onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-city">City</Label>
                                    <Input
                                      id="edit-city"
                                      value={addressData.city}
                                      onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-state">State</Label>
                                    <Input
                                      id="edit-state"
                                      value={addressData.state}
                                      onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-zipCode">ZIP Code</Label>
                                    <Input
                                      id="edit-zipCode"
                                      value={addressData.zipCode}
                                      onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input
                                      id="edit-country"
                                      value={addressData.country}
                                      onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>
                                <Button type="submit" className="w-full">Update Address</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {user.addresses.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No addresses added</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first shipping address to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
