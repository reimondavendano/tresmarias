// --- Frontend: components/StylistManagement.tsx ---
// This component handles the UI for managing stylists, including a form
// for adding/editing and a list view. It now makes a real (conceptual)
// API call to upload images to a local directory via a Next.js API route.

'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchStylists,
  addStylist,
  updateStylist,
  deleteStylist,
} from '@/store/slices/stylistsSlice';
import { Stylist } from '@/types'; // Import your Stylist type from '@/types'

// Assuming you have shadcn/ui components or similar custom components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { XCircle, PlusCircle, Edit, Trash2, UploadCloud, Loader2 } from 'lucide-react';

// Import AdminLayout component (if used, ensure path is correct)
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardTitle } from '@/components/ui/card'; // Ensure correct path for Card components

export default function StylistManagement() {
  const dispatch = useAppDispatch();
  // Select stylist-related states from the Redux store
  const stylists = useAppSelector((state) => state.stylists.stylists);
  const isLoading = useAppSelector((state) => state.stylists.isLoadingStylists);
  const error = useAppSelector((state) => state.stylists.errorStylists);
  const isAdding = useAppSelector((state) => state.stylists.isAddingStylist);
  const addError = useAppSelector((state) => state.stylists.addStylistError);
  const isUpdating = useAppSelector((state) => state.stylists.isUpdatingStylist);
  const updateError = useAppSelector((state) => state.stylists.updateStylistError);
  const isDeleting = useAppSelector((state) => state.stylists.isDeletingStylist);
  const deleteError = useAppSelector((state) => state.stylists.deleteStylistError);

  // Form state for adding/editing stylists
  const [formData, setFormData] = useState<Partial<Stylist>>({
    name: '',
    email: '',
    phone: '',
    specialties: [], // Initialize as empty array
    experience_years: 0, // Add experience_years
    rating: 0,
    image_url: '', // This will store the local path after successful upload
    is_available: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStylistId, setEditingStylistId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stylistToDeleteId, setStylistToDeleteId] = useState<string | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Fetch stylists on component mount
  useEffect(() => {
    dispatch(fetchStylists());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'rating' ? Number(value) : value
    }));
  };

  // Handle file selection for image upload
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

    let stylistImageUrl: string = formData.image_url || '';

    if (selectedFile) {
      // Use the actual local upload function
      const uploadedPath = await uploadImageToLocalAssets(selectedFile);
      if (uploadedPath === null) {
        // If image upload failed, prevent form submission
        return;
      }
      stylistImageUrl = uploadedPath; // Store the local path
    }

    // Prepare data for submission, ensuring all required fields are present
    const stylistDataToSubmit: Omit<Stylist, 'id' | 'created_at' | 'updated_at'> = {
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      specialties: formData.specialties || [],
      experience_years: formData.experience_years || 0,
      rating: formData.rating ?? 0,
      image_url: stylistImageUrl, // This now holds the local path
      is_available: formData.is_available ?? true,
    };

    if (isEditMode && editingStylistId) {
      // Update existing stylist
      dispatch(updateStylist({ id: editingStylistId, updates: stylistDataToSubmit }))
        .unwrap()
        .then(() => {
          setShowAddEditDialog(false);
          resetForm();
          dispatch(fetchStylists()); // Re-fetch to ensure list is updated
        })
        .catch((err) => {
          console.error('Failed to update stylist:', err);
          // Error state is handled by Redux slice
        });
    } else {
      // Add new stylist
      dispatch(addStylist(stylistDataToSubmit))
        .unwrap()
        .then(() => {
          setShowAddEditDialog(false);
          resetForm();
          dispatch(fetchStylists()); // Re-fetch to ensure list is updated
        })
        .catch((err) => {
          console.error('Failed to add stylist:', err);
          // Error state is handled by Redux slice
        });
    }
  };

  // Set form data for editing
  const handleEdit = (stylist: Stylist) => {
    // Ensure specialties is an array when setting form data
    setFormData({
      ...stylist,
      specialties: Array.isArray(stylist.specialties) ? stylist.specialties : [],
    });
    setSelectedFile(null); // Clear selected file when editing
    setIsEditMode(true);
    setEditingStylistId(stylist.id);
    setShowAddEditDialog(true);
  };

  // Confirm delete action
  const handleDeleteConfirm = (id: string) => {
    setStylistToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Execute delete action
  const handleDelete = () => {
    if (stylistToDeleteId) {
      dispatch(deleteStylist(stylistToDeleteId))
        .unwrap()
        .then(() => {
          setShowDeleteConfirm(false);
          setStylistToDeleteId(null);
          // No need to re-fetch, slice handles removal locally
        })
        .catch((err) => {
          console.error('Failed to delete stylist:', err);
          // Error state is handled by Redux slice
        });
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      experience_years: 0,
      rating: 0,
      image_url: '', // Reset to empty string
      is_available: true,
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingStylistId(null);
    setImageUploadError(null);
    setImageUploadLoading(false);
  };

  // Filter stylists to exclude "Any Available Stylist"
  const filteredStylists = stylists.filter(stylist => stylist.name !== 'Any Available Stylist');

  return (
  
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-3xl font-bold text-salon-primary mb-8">Stylist Management</h1>

        {/* Add New Stylist Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={() => { setShowAddEditDialog(true); resetForm(); }} className="bg-salon-primary hover:bg-salon-primary text-white flex items-center px-4 py-2 rounded-md shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Stylist
          </Button>
        </div>

        {/* Add/Edit Stylist Dialog */}
        <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-salon-primary">{isEditMode ? 'Edit Stylist' : 'Add New Stylist'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {isEditMode ? 'Make changes to the stylist here.' : 'Fill in the details to add a new stylist.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience_years" className="text-right">Experience (Years)</Label>
                <Input id="experience_years" name="experience_years" type="number" value={formData.experience_years || 0} onChange={handleChange} className="col-span-3" />
              </div>
              {/* Image Upload Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">Image</Label>
                <div className="col-span-3">
                  <Input id="image_url" name="image_url" type="file" onChange={handleFileChange} className="mb-2" />
                  {selectedFile && (
                    <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>
                  )}
                  {formData.image_url && !selectedFile && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      Current: <img src={formData.image_url} alt="Current Stylist" className="w-16 h-16 object-cover rounded-md ml-2" />
                    </div>
                  )}
                  {imageUploadLoading && <p className="text-blue-500 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading image...</p>}
                  {imageUploadError && <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>}
                </div>
              </div>
              {/* Add fields for specialties, rating, is_available if needed in the form */}
              {/*
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialties" className="text-right">Specialties</Label>
                <Input id="specialties" name="specialties" value={formData.specialties?.join(', ') || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., Haircut, Coloring, Nails" />
              </div>
              */}

              {/* Display Redux errors for add/update */}
              {(addError || updateError) && (
                <p className="text-red-500 text-sm text-center mt-2">{addError || updateError}</p>
              )}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddEditDialog(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={isAdding || isUpdating || imageUploadLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  {(isAdding || isUpdating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditMode ? 'Save Changes' : 'Add Stylist'}
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
                Are you sure you want to delete this stylist? This action cannot be undone.
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


        {/* Stylists List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-salon-primary mb-4">Our Stylists</h2>
          {isLoading && <p className="text-center text-gray-500">Loading stylists...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!isLoading && filteredStylists.length === 0 && !error && (
            <p className="text-center text-gray-500">No stylists found. Add a new stylist to get started!</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStylists.map((stylist) => (
              <Card key={stylist.id} className="flex flex-col rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
                  {stylist.image_url ? (
                    <img
                      src={stylist.image_url || `https://placehold.co/400x400/E0E7FF/4338CA?text=${stylist.name.split(' ').map(n => n[0]).join('')}`}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/400x200/cccccc/333333?text=No+Image`; }} // Fallback
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{stylist.name}</CardTitle>
                  <p className="text-gray-700 text-sm mb-2">Email: {stylist.email}</p>
                  <p className="text-gray-700 text-sm mb-2">Phone: {stylist.phone}</p>
                  {/* Display specialties, rating, etc. if available */}
                  {Array.isArray(stylist.specialties) && stylist.specialties.length > 0 && (
                    <p className="text-gray-600 text-sm mb-1">Specialties: {stylist.specialties.join(', ')}</p>
                  )}
                  {typeof stylist.experience_years === 'number' && (
                    <p className="text-gray-600 text-sm mb-1">Experience: {stylist.experience_years} years</p>
                  )}
                  {typeof stylist.rating === 'number' && (
                    <p className="text-gray-600 text-sm mb-1">Rating: {stylist.rating.toFixed(1)}</p>
                  )}
                  <p className="text-gray-600 text-sm mb-3">Available: {stylist.is_available ? 'Yes' : 'No'}</p>
                </CardContent>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(stylist)} className="text-blue-600 hover:bg-blue-50">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteConfirm(stylist.id)} className="text-red-600 hover:bg-red-50">
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
