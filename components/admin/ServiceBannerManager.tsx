// components/admin/ServiceBannerManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchAllServiceBanners,
  createServiceBanner,
  updateServiceBanner,
  deleteServiceBanner,
  resetServiceBannerErrors,
  CreateBannerPayload,
  UpdateBannerPayload,
} from '@/store/slices/serviceBannerSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

import { ServiceBanner } from '@/types';

export default function ServiceBannerManager() {
  const dispatch = useAppDispatch();
  const { allBanners, isLoading, error, isCreating, createError, isUpdating, updateError, isDeleting, deleteError } = useAppSelector(
    (state) => state.serviceBanner
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<ServiceBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: false,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // --- NEW STATE FOR RADIO GROUP SELECTION ---
  const [selectedActiveBannerId, setSelectedActiveBannerId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllServiceBanners());
  }, [dispatch]);

  // --- NEW useEffect to initialize selectedActiveBannerId ---
  useEffect(() => {
    // Find the banner that is currently active from the fetched list
    const active = allBanners.find(banner => banner.is_active);
    if (active) {
      setSelectedActiveBannerId(active.id);
    } else {
      setSelectedActiveBannerId(null); // No banner is active
    }
  }, [allBanners]); // Re-run when allBanners changes (e.g., after initial fetch or an update)

  useEffect(() => {
    if (error || createError || updateError || deleteError) {
      const errorMessage = error || createError || updateError || deleteError;
      toast.error(errorMessage, { id: 'banner-action-error' });
      dispatch(resetServiceBannerErrors());
    }
  }, [error, createError, updateError, deleteError, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setUploadedFile(null);
      setPreviewImageUrl(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditClick = (banner: ServiceBanner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      is_active: banner.is_active,
    });
    setPreviewImageUrl(banner.image_url);
    setUploadedFile(null); // Clear uploaded file when editing an existing banner
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setCurrentBanner(null);
    setFormData({ title: '', description: '', is_active: false });
    setUploadedFile(null);
    setPreviewImageUrl(null);
    setIsFormOpen(false);
    dispatch(resetServiceBannerErrors());
  };

  const handleDeleteClick = async (id: string) => {
    toast.loading('Deleting banner...', { id: 'delete-banner' });
    const resultAction = await dispatch(deleteServiceBanner(id));
    if (deleteServiceBanner.fulfilled.match(resultAction)) {
      toast.success('Banner deleted successfully!', { id: 'delete-banner' });
    } else {
      const errorMessage = resultAction.payload as string || 'Failed to delete banner.';
      toast.error(errorMessage, { id: 'delete-banner' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentBanner) {
      // Update existing banner
      toast.loading('Updating banner...', { id: 'update-banner' });
      const payload: UpdateBannerPayload = {
        id: currentBanner.id,
        title: formData.title,
        description: formData.description,
        is_active: formData.is_active,
        imageFile: uploadedFile || undefined, // Pass file if new one is selected
        image_url: uploadedFile ? undefined : (previewImageUrl === null ? null : currentBanner.image_url), // Handle image_url explicitly
      };

      const resultAction = await dispatch(updateServiceBanner(payload));
      if (updateServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Banner updated successfully!', { id: 'update-banner' });
        handleCancelEdit();
        dispatch(fetchAllServiceBanners()); // Re-fetch all banners to ensure UI syncs with DB state
      } else {
        const errorMessage = resultAction.payload as string || 'Failed to update banner.';
        toast.error(errorMessage, { id: 'update-banner' });
      }
    } else {
      // Create new banner
      toast.loading('Creating banner...', { id: 'create-banner' });
      const payload: CreateBannerPayload = {
        title: formData.title,
        description: formData.description,
        is_active: formData.is_active,
        imageFile: uploadedFile || undefined,
      };

      const resultAction = await dispatch(createServiceBanner(payload));
      if (createServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Banner created successfully!', { id: 'create-banner' });
        setFormData({ title: '', description: '', is_active: false });
        setUploadedFile(null);
        setPreviewImageUrl(null);
        setIsFormOpen(false);
        dispatch(fetchAllServiceBanners()); // Re-fetch all banners to ensure UI syncs with DB state
      } else {
        const errorMessage = resultAction.payload as string || 'Failed to create banner.';
        toast.error(errorMessage, { id: 'create-banner' });
      }
    }
  };

  // --- NEW FUNCTION TO HANDLE RADIO GROUP CHANGE ---
  const handleActivateBanner = useCallback(async (bannerId: string) => {
    // ... (optimistic UI update and toast loading)

      const payload: UpdateBannerPayload = {
          id: bannerId,
          is_active: true, // This correctly signals the intent to activate THIS banner
      };

      // Dispatch the update thunk
      const resultAction = await dispatch(updateServiceBanner(payload));

      if (updateServiceBanner.fulfilled.match(resultAction)) {
          toast.success('Banner successfully set as active!', { id: 'activate-banner' });
          dispatch(fetchAllServiceBanners()); // <--- This refetches data, crucial for UI update
      } else {
          // ... (error handling)
      }
  }, [dispatch, selectedActiveBannerId, allBanners]);

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8 p-6 shadow-lg rounded-xl">
        <CardHeader className="mb-4">
          <CardTitle className="text-2xl font-bold text-salon-dark">Manage Service Banners</CardTitle>
          <p className="text-gray-600">Create, edit, and set the active service banner for your homepage.</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} className="mb-6 bg-salon-primary hover:bg-salon-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            {isFormOpen ? 'Close Form' : 'Add New Banner'}
          </Button>

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
              <h3 className="text-xl font-semibold text-salon-dark">
                {currentBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div>
                <Label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Image</Label>
                <Input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border p-2 rounded-md"
                  disabled={isCreating || isUpdating}
                />
                {previewImageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                    <Image src={previewImageUrl} alt="Banner Preview" width={200} height={100} className="rounded-md object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange({
                    target: { name: 'is_active', type: 'checkbox', checked: checked as boolean, value: '' }
                  } as React.ChangeEvent<HTMLInputElement>)}
                  disabled={isCreating || isUpdating}
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">Set as Active Banner (Only one can be active)</Label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isCreating || isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-salon-primary hover:bg-salon-primary/90" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {currentBanner ? (isUpdating ? 'Updating...' : 'Update Banner') : (isCreating ? 'Creating...' : 'Create Banner')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-salon-dark mb-6">Current Banners</h2>

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-salon-primary mx-auto my-12" />
      ) : error ? (
        <p className="text-red-500 text-center my-12">Error loading banners: {error}</p>
      ) : allBanners.length === 0 ? (
        <p className="text-gray-500 text-center my-12">No service banners created yet.</p>
      ) : (
        <RadioGroup
          value={selectedActiveBannerId || ''} // Use the state variable here
          onValueChange={handleActivateBanner} // Call your new handler
          className="space-y-4"
        >
          {allBanners.map((banner) => (
            <Card
              key={banner.id}
              // The active class should be based on `selectedActiveBannerId` from state
              className={`flex items-center space-x-4 p-4 border rounded-lg ${
                selectedActiveBannerId === banner.id ? 'border-salon-primary ring-2 ring-salon-primary' : ''
              }`}
            >
              <CardContent className="flex items-center space-x-4 p-0 flex-grow">
                <RadioGroupItem value={banner.id} id={`banner-${banner.id}`} />
                <Label
                  htmlFor={`banner-${banner.id}`}
                  className="flex flex-grow items-center space-x-4 cursor-pointer"
                >
                  {banner.image_url ? (
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover h-20 w-20"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-20 w-20 bg-gray-200 rounded-md text-gray-500">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{banner.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{banner.description || 'No description.'}</p>
                    <p className="text-sm">
                      Status: <span className={`font-medium ${banner.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </Label>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(banner)} disabled={isDeleting}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(banner.id)}
                    disabled={isDeleting || (selectedActiveBannerId === banner.id && allBanners.length === 1)}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}