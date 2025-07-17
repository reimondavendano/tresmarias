import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchServices,
  addService,
  updateService,
  deleteService,
} from '@/store/slices/servicesSlice';
import { Service } from '@/types'; // Import your Service type

// Assuming you have shadcn/ui components or similar custom components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label }
 from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { XCircle, PlusCircle, Edit, Trash2, UploadCloud, Loader2, Tag } from 'lucide-react'; // Added Tag import

// Import AdminLayout component
import { AdminLayout } from '@/components/admin/AdminLayout'; // Assuming this path for your AdminLayout
import { Card, CardContent, CardTitle } from '../ui/card'; // Ensure correct path for Card components

// Define categories for the select input
const serviceCategories = ['hair', 'nails', 'foot', 'facial', 'other'];

export default function ServiceManagement() {
  const dispatch = useAppDispatch();
  const services = useAppSelector((state) => state.services.services);
  const isLoading = useAppSelector((state) => state.services.isLoadingServices);
  const error = useAppSelector((state) => state.services.errorServices);
  const isAdding = useAppSelector((state) => state.services.isAddingService);
  const addError = useAppSelector((state) => state.services.addServiceError);
  const isUpdating = useAppSelector((state) => state.services.isUpdatingService);
  const updateError = useAppSelector((state) => state.services.updateServiceError);
  const isDeleting = useAppSelector((state) => state.services.isDeletingService);
  const deleteError = useAppSelector((state) => state.services.deleteServiceError);

  // Form state for adding/editing services
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    duration: 0, // Keep duration in state as it's part of Service type
    category: 'hair',
    image: '', // This will store the URL after upload
    is_active: true,
    discount: 0, // New: Initialize discount
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: (name === 'price' || name === 'discount') ? Number(value) : value 
    }));
  };

  // Handle category select change
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  /**
   * Handles uploading an image to the local 'public/assets/img' directory
   * via a Next.js API route.
   * @param file The File object to upload.
   * @returns The public URL path of the uploaded image or null if an error occurs.
   */
  const uploadImageToLocalAssets = async (file: File): Promise<string | null> => {
    setImageUploadLoading(true);
    setImageUploadError(null);
    try {
      const formData = new FormData();
      formData.append('image', file); // 'image' is the field name expected by the backend API

      const response = await fetch('/api/upload-image', { // Call your new API route
        method: 'POST',
        body: formData, // FormData automatically sets Content-Type: multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image to local assets.');
      }

      const result = await response.json();
      console.log(`Image uploaded to local assets. Path: ${result.imageUrl}`);
      return result.imageUrl; // The public path returned by your API
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setImageUploadError(err.message || 'Failed to upload image locally.');
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl: string = formData.image || '';

    if (selectedFile) {
      // Use the actual local upload function
      const uploadedUrl = await uploadImageToLocalAssets(selectedFile);
      if (uploadedUrl === null) {
        // If image upload failed, prevent form submission
        return;
      }
      imageUrl = uploadedUrl; // imageUrl is now guaranteed to be a string
    }

    const serviceDataToSubmit: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'total_price'> = { // Omit total_price
      name: formData.name || '',
      description: formData.description || '',
      price: formData.price || 0,
      duration: formData.duration || 0, // Keep duration here as it's part of the Service type
      category: formData.category || 'other',
      image: imageUrl, // Now imageUrl is guaranteed to be a string
      is_active: formData.is_active ?? true, // Default to true if not set
      discount: formData.discount || 0, // New: Include discount
    };

    if (isEditMode && editingServiceId) {
      // Update existing service
      dispatch(updateService({ id: editingServiceId, updates: serviceDataToSubmit }))
        .unwrap()
        .then(() => {
          setShowAddEditDialog(false);
          resetForm();
          dispatch(fetchServices()); // Re-fetch to ensure list is updated
        })
        .catch((err) => {
          console.error('Failed to update service:', err);
          // Error state is handled by Redux slice
        });
    } else {
      // Add new service
      dispatch(addService(serviceDataToSubmit))
        .unwrap()
        .then(() => {
          setShowAddEditDialog(false);
          resetForm();
          dispatch(fetchServices()); // Re-fetch to ensure list is updated
        })
        .catch((err) => {
          console.error('Failed to add service:', err);
          // Error state is handled by Redux slice
        });
    }
  };

  // Set form data for editing
  const handleEdit = (service: Service) => {
    setFormData({ ...service });
    setSelectedFile(null); // Clear selected file when editing
    setIsEditMode(true);
    setEditingServiceId(service.id);
    setShowAddEditDialog(true);
  };

  // Confirm delete action
  const handleDeleteConfirm = (id: string) => {
    setServiceToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Execute delete action
  const handleDelete = () => {
    if (serviceToDeleteId) {
      dispatch(deleteService(serviceToDeleteId))
        .unwrap()
        .then(() => {
          setShowDeleteConfirm(false);
          setServiceToDeleteId(null);
          // No need to re-fetch, slice handles removal locally
        })
        .catch((err) => {
          console.error('Failed to delete service:', err);
          // Error state is handled by Redux slice
        });
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 0, // Reset duration to default
      category: 'hair',
      image: '',
      is_active: true,
      discount: 0, // New: Reset discount
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingServiceId(null);
    setImageUploadError(null);
    setImageUploadLoading(false);
  };

  // Function to allow only numbers and specific control keys
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow numbers (0-9), backspace, delete, tab, arrow keys
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) && // Not a number
      charCode !== 8 && // Backspace
      charCode !== 46 && // Delete
      charCode !== 9 &&  // Tab
      !(charCode >= 37 && charCode <= 40) // Arrow keys
    ) {
      event.preventDefault();
    }
  };

  return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-3xl font-bold text-salon-primary mb-8">Service Management</h1>

        {/* Add New Service Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={() => { setShowAddEditDialog(true); resetForm(); }} className="bg-salon-primary hover:bg-salon-primary text-white flex items-center px-4 py-2 rounded-md shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Service
          </Button>
        </div>

        {/* Add/Edit Service Dialog */}
        <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-salon-primary">{isEditMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {isEditMode ? 'Make changes to the service here.' : 'Fill in the details to add a new service.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="text" // Changed to text
                  value={formData.price || 0} 
                  onChange={handleChange} 
                  onKeyPress={handleKeyPress} // Added onKeyPress
                  className="col-span-3" 
                  required 
                />
              </div>

              {/* New: Discount Input */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">Discount (%)</Label>
                <Input 
                  id="discount" 
                  name="discount" 
                  type="text" // Changed to text
                  value={formData.discount || 0} 
                  onChange={handleChange} 
                  onKeyPress={handleKeyPress} // Added onKeyPress
                  className="col-span-3" 
                  min="0" 
                  max="100" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select onValueChange={handleCategoryChange} value={formData.category || 'hair'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image</Label>
                <div className="col-span-3">
                  <Input id="image" name="image" type="file" onChange={handleFileChange} className="mb-2" />
                  {selectedFile && (
                    <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>
                  )}
                  {formData.image && !selectedFile && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      Current: <img src={formData.image} alt="Current Service" className="w-16 h-16 object-cover rounded-md ml-2" />
                    </div>
                  )}
                  {imageUploadLoading && <p className="text-blue-500 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading image...</p>}
                  {imageUploadError && <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>}
                </div>
              </div>
              {/* Display Redux errors for add/update */}
              {(addError || updateError) && (
                <p className="text-red-500 text-sm text-center mt-2">{addError || updateError}</p>
              )}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddEditDialog(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={isAdding || isUpdating || imageUploadLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {(isAdding || isUpdating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditMode ? 'Save Changes' : 'Add Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-700">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete this service? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <p className="text-red-500 text-sm text-center mt-2">{deleteError}</p>
            )}
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="mr-2">Cancel</Button>
              <Button type="button" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Services List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-salon-primary mb-4">Our Services</h2>
          {isLoading && <p className="text-center text-gray-500">Loading services...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!isLoading && services.length === 0 && !error && (
            <p className="text-center text-gray-500">No services found. Add a new service to get started!</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
                  {/* Discount Tag - Only show if discount is a number and greater than 0 */}
                  {typeof service.discount === 'number' && service.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10 flex items-center shadow-md"> {/* Adjusted position and styling */}
                      <Tag className="h-3 w-3 mr-1" /> {/* Smaller Tag icon */}
                      {`P${service.discount} OFF`}
                    </div>
                  )}

                  {service.image ? (
                    <img
                      src={service.image || 'https://placehold.co/400x300/E0E7FF/4338CA?text=Service%20Image'}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/400x200/cccccc/333333?text=No+Image`; }} // Fallback
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{service.name}</CardTitle>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">{service.description}</p>
                  
                  {/* Price Display Logic */}
                  <div className="flex items-center gap-2 mb-1">
                    {typeof service.discount === 'number' && service.discount > 0 ? (
                      <>
                        {/* Original Price (Strikethrough) for discounted items */}
                        <span className="text-base text-gray-500 line-through">
                          P{service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {/* Total Price (New Price) for discounted items */}
                        {service.total_price !== undefined && (
                          <span className="text-lg font-bold text-red-600">
                            P{service.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        {/* Fallback if total_price is missing but discount exists (should not happen if DB computes) */}
                        {service.total_price === undefined && (
                          <span className="text-lg font-bold text-red-600">
                            P{(service.price * (1 - (service.discount / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </>
                    ) : (
                      // If no discount or discount is 0, display only total_price (or original price if total_price is absent)
                      <span className="text-lg font-bold text-salon-primary">
                        P{(service.total_price !== undefined ? service.total_price : service.price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3">Category: {service.category}</p>
                </CardContent>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="text-blue-600 hover:bg-blue-50">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteConfirm(service.id)} className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
  );
}
