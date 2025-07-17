// components/admin/ServiceBannerManager.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchAllServiceBanners, // Ensure this is imported
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
  const [currentBanner, setCurrentBanner] = useState<Partial<ServiceBanner> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedActiveBannerId, setSelectedActiveBannerId] = useState<string | null>(null);

  // New useEffect to fetch all banners on component mount
  useEffect(() => {
    dispatch(fetchAllServiceBanners());
  }, [dispatch]); // Run once on mount

  // Initialize selectedActiveBannerId from Redux state on load or when allBanners changes
  useEffect(() => {
    if (!isLoading && allBanners.length > 0) {
      const active = allBanners.find(banner => banner.is_active);
      setSelectedActiveBannerId(active ? active.id : null);
    } else if (!isLoading && allBanners.length === 0) {
      setSelectedActiveBannerId(null);
    }
  }, [allBanners, isLoading]);

  // Error and Success toasts for general fetch errors
  useEffect(() => {
    if (error) { // General fetch error
      toast.error(`Error fetching banners: ${error}`);
      dispatch(resetServiceBannerErrors());
    }
  }, [error, dispatch]);

  const handleEditClick = (banner: ServiceBanner) => {
    setCurrentBanner(banner);
    setPreviewImage(banner.image_url && banner.image_url !== 'EMPTY' ? banner.image_url : null);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setCurrentBanner({ is_active: false });
    setPreviewImage(null);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setCurrentBanner(null);
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewImage(currentBanner?.image_url && currentBanner.image_url !== 'EMPTY' ? currentBanner.image_url : null);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const loadingToastId = toast.loading('Deleting banner...');
      const resultAction = await dispatch(deleteServiceBanner(id));
      if (deleteServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Banner deleted successfully!', { id: loadingToastId });
      } else {
        toast.error(`Failed to delete banner: ${deleteError || 'An unknown error occurred.'}`, { id: loadingToastId });
        dispatch(resetServiceBannerErrors());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBanner?.title) {
      toast.error('Title is required.');
      return;
    }

    if (!currentBanner?.id && !imageFile && (!previewImage || previewImage === 'EMPTY')) {
      toast.error('An image is recommended for new banners to be fully visible.');
    }

    let loadingToastId: string | number | undefined;

    if (currentBanner.id) {
      const payload: UpdateBannerPayload = {
        id: currentBanner.id,
        title: currentBanner.title,
        description: currentBanner.description === '' ? null : currentBanner.description,
        is_active: currentBanner.is_active,
      };

      if (imageFile) {
        payload.imageFile = imageFile;
      } else if (previewImage === null) {
        payload.image_url = null;
      } else if (currentBanner.image_url === previewImage && currentBanner.image_url !== 'EMPTY') {
        delete payload.image_url;
      } else if (currentBanner.image_url === 'EMPTY' && previewImage === null) {
        payload.image_url = null;
      } else if (currentBanner.image_url === 'EMPTY' && previewImage === 'EMPTY') {
        delete payload.image_url;
      }

      loadingToastId = toast.loading('Updating banner...');
      const resultAction = await dispatch(updateServiceBanner(payload));
      if (updateServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Banner updated successfully!', { id: loadingToastId });
        handleCancelForm();
      } else {
        toast.error(`Failed to update banner: ${updateError || 'An unknown error occurred.'}`, { id: loadingToastId });
        dispatch(resetServiceBannerErrors());
      }
    } else {
      const payload: CreateBannerPayload = {
        title: currentBanner.title,
        description: currentBanner.description === '' ? null : currentBanner.description,
        is_active: currentBanner.is_active || false,
        imageFile: imageFile || undefined,
      };

      loadingToastId = toast.loading('Creating banner...');
      const resultAction = await dispatch(createServiceBanner(payload));
      if (createServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Banner created successfully!', { id: loadingToastId });
        handleCancelForm();
      } else {
        toast.error(`Failed to create banner: ${createError || 'An unknown error occurred.'}`, { id: loadingToastId });
        dispatch(resetServiceBannerErrors());
      }
    }
  };

  const handleRadioChange = async (bannerId: string) => {
    if (selectedActiveBannerId !== bannerId) {
      setSelectedActiveBannerId(bannerId);

      const loadingToastId = toast.loading('Updating active banner...');
      const resultAction = await dispatch(updateServiceBanner({
        id: bannerId,
        is_active: true,
      }));

      if (updateServiceBanner.fulfilled.match(resultAction)) {
        toast.success('Active banner updated successfully!', { id: loadingToastId });
      } else {
        toast.error(`Failed to update active banner: ${updateError || 'An unknown error occurred.'}`, { id: loadingToastId });
        setSelectedActiveBannerId(allBanners.find(b => b.is_active)?.id || null);
        dispatch(resetServiceBannerErrors());
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Service Banner Management</h1>

      <Button onClick={handleCreateClick} className="mb-6">
        <PlusCircle className="mr-2 h-4 w-4" /> Create New Banner
      </Button>

      {isFormOpen && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentBanner?.id ? 'Edit Service Banner' : 'Create New Service Banner'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentBanner?.title || ''}
                  onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={currentBanner?.description || ''}
                  onChange={(e) => setCurrentBanner({ ...currentBanner, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                {(previewImage || (currentBanner?.image_url && currentBanner.image_url !== 'EMPTY' && !imageFile)) && (
                  <div className="mt-4 flex items-center space-x-4">
                    {previewImage && previewImage !== 'EMPTY' ? (
                        <Image src={previewImage} alt="New Banner Preview" width={200} height={100} className="rounded-md object-cover" />
                    ) : (currentBanner?.image_url && currentBanner.image_url !== 'EMPTY' &&
                      <Image src={currentBanner.image_url} alt="Current Banner" width={200} height={100} className="rounded-md object-cover" />
                    )}
                    {(previewImage || (currentBanner?.image_url && currentBanner.image_url !== 'EMPTY')) && !imageFile && (
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                            setPreviewImage(null);
                            setCurrentBanner(prev => prev ? {...prev, image_url: null} : null);
                        }}>
                            Clear Image
                        </Button>
                    )}
                  </div>
                )}
                {!previewImage && (!currentBanner?.image_url || currentBanner?.image_url === 'EMPTY') && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center"><ImageIcon className="mr-1 h-4 w-4"/> No image selected.</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={currentBanner?.is_active || false}
                  onCheckedChange={(checked) => setCurrentBanner({ ...currentBanner, is_active: Boolean(checked) })}
                  disabled={!!currentBanner?.id}
                />
                <Label htmlFor="isActive">Set as Active Banner (for new banners only)</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    currentBanner?.id ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {currentBanner?.id ? 'Update Banner' : 'Create Banner'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-bold mb-4">All Banners</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading banners...</span>
        </div>
      ) : allBanners.length === 0 ? (
        <p className="text-center text-gray-500">No banners created yet.</p>
      ) : (
        <RadioGroup
          onValueChange={handleRadioChange}
          value={selectedActiveBannerId || ''}
          className="space-y-4"
        >
          {allBanners.map((banner) => (
            <Card key={banner.id} className={selectedActiveBannerId === banner.id ? "border-2 border-blue-500" : ""}>
              <CardContent className="p-4 flex items-center space-x-4">
                <RadioGroupItem value={banner.id} id={`banner-${banner.id}`} disabled={isUpdating || isDeleting} />
                <Label htmlFor={`banner-${banner.id}`} className="flex-grow flex items-center space-x-4 cursor-pointer">
                  {banner.image_url && banner.image_url !== 'EMPTY' ? (
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      width={100}
                      height={50}
                      className="rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[100px] h-[50px] bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-xs flex-shrink-0">
                      No Image
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