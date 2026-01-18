"use client"

import Image from "next/image"
import { useState, useCallback, useMemo } from "react"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, GripVerticalIcon } from "lucide-react"
import { toast } from "sonner"

import { useFileUpload, formatBytes, type FileWithPreview } from "../hooks/useFileUpload"
import { Button } from "@/components/ui/button"
import {
  createProductImage,
  deleteProductImage,
  updateProductImagesOrder,
} from "../actions/images"
import { useProductData } from "../hooks/useProductData"

interface MediaTabProps {
  product: Record<string, any>
}

type CombinedImage = {
  id: string
  isUploading: boolean
  preview: string
  altText: string
  size?: number
  order: number
}

export function MediaTab({ product: initialProduct }: MediaTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  // Use SWR hooks for data fetching like VariantsTab does
  const {
    product,
    loading: productLoading,
    error: productError,
    refetch,
  } = useProductData(initialProduct?.id);

  // Use the fetched product data or fall back to initial product
  const currentProduct = product || initialProduct;
  const productImages = currentProduct?.productImages || [];

  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
  const maxFiles = 6

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
    maxFiles,
    onFilesAdded: async (addedFiles: FileWithPreview[]) => {
      if (!currentProduct?.id) {
        toast.error('Product ID not found')
        return
      }

      // Don't block UI - files are already shown optimistically
      const successfulUploads: string[] = []

      try {
        // Upload each file
        for (const fileWithPreview of addedFiles) {
          const file = fileWithPreview.file as File
          const result = await createProductImage({
            image: file,
            altText: file.name,
            productId: currentProduct.id,
          })

          if (result.success) {
            toast.success(`${file.name} uploaded successfully`)
            successfulUploads.push(fileWithPreview.id)
          } else {
            toast.error(`Failed to upload ${file.name}: ${result.error}`)
          }
        }

        // Clear local files state and refresh product data
        clearFiles()
        refetch()
      } catch (error) {
        console.error('Error uploading images:', error)
        toast.error('Failed to upload images')
      }
    }
  })

  // Combine remote images and local uploading files into a single list
  const combinedImages: CombinedImage[] = useMemo(() => {
    const remoteImages = productImages
      .filter((img: any) => (img.image && img.image.url) || img.imagePath)
      .map((img: any) => ({
        id: img.id,
        isUploading: false,
        preview: img.image?.url || img.imagePath || '',
        altText: img.altText || (img.image?.id ? `${img.image.id}.${img.image.extension}` : 'Product image'),
        size: img.image?.filesize,
        order: img.order || 0,
      }))

    const localFiles = files
      .filter(file => file.file instanceof File)
      .map((file, index) => ({
        id: file.id,
        isUploading: true,
        preview: file.preview,
        altText: (file.file as File).name,
        size: (file.file as File).size,
        order: productImages.length + index,
      }))

    return [...remoteImages, ...localFiles].sort((a, b) => a.order - b.order)
  }, [productImages, files])

  // Drag and drop handlers for reordering images
  const handleImageDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    setDraggedItem(imageId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleImageDragOver = useCallback((e: React.DragEvent, imageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(imageId)
  }, [])

  const handleImageDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleImageDrop = useCallback(async (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetImageId || !currentProduct?.id) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    setIsLoading(true)

    try {
      // Get current ordered images
      const orderedImages = productImages
        .filter((img: any) => (img.image && img.image.url) || img.imagePath)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

      // Find the indices
      const draggedIndex = orderedImages.findIndex((img: any) => img.id === draggedItem)
      const targetIndex = orderedImages.findIndex((img: any) => img.id === targetImageId)

      if (draggedIndex === -1 || targetIndex === -1) {
        throw new Error('Invalid drag operation')
      }

      // Create new array with reordered items
      const newOrder = [...orderedImages]
      const draggedImage = newOrder[draggedIndex]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedImage)

      // Create order updates with new indices
      const orderUpdates = newOrder.map((img: any, index: number) => ({
        id: img.id,
        order: index
      }))

      // Call the update function
      const result = await updateProductImagesOrder(currentProduct.id, orderUpdates)

      if (result.success) {
        toast.success('Image order updated successfully')
        refetch()
      } else {
        toast.error('Failed to update image order')
      }
    } catch (error) {
      console.error('Error reordering images:', error)
      toast.error('Failed to update image order')
    } finally {
      setIsLoading(false)
      setDraggedItem(null)
      setDragOverItem(null)
    }
  }, [draggedItem, currentProduct?.id, productImages, refetch])

  const handleImageDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

  // Handle file removal
  const handleRemove = useCallback(async (fileId: string, isFromServer: boolean = false) => {
    if (isFromServer && currentProduct?.id) {
      setIsLoading(true)
      try {
        const result = await deleteProductImage(fileId, currentProduct.id)
        if (result.success) {
          toast.success('Image removed successfully')
          refetch()
        } else {
          toast.error(result.error || 'Failed to remove image')
        }
      } catch (error) {
        console.error('Error removing image:', error)
        toast.error('Failed to remove image')
      } finally {
        setIsLoading(false)
      }
    } else {
      removeFile(fileId)
    }
  }, [currentProduct?.id, removeFile, refetch])

  // Show loading state while fetching product data
  if (productLoading) {
    return <div>Loading product data...</div>
  }

  if (productError) {
    return <div>Error loading product data</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={productImages.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
          <p className="text-muted-foreground text-xs">
            SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={openFileDialog}
            disabled={isLoading}
          >
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            {isLoading ? 'Uploading...' : 'Select images'}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* Combined image gallery (remote + uploading) */}
      {combinedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-base font-medium">Product Images</h3>
            <span className="text-xs uppercase opacity-60">Drag to reorder</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {combinedImages.map((img) => (
              <div
                key={img.id}
                draggable={!isLoading && !img.isUploading}
                onDragStart={(e) => handleImageDragStart(e, img.id)}
                onDragOver={(e) => handleImageDragOver(e, img.id)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, img.id)}
                onDragEnd={handleImageDragEnd}
                className={`bg-background relative flex flex-col rounded-md border transition-all ${
                  draggedItem === img.id
                    ? 'opacity-50 scale-95'
                    : dragOverItem === img.id
                      ? 'border-primary bg-accent/50'
                      : 'hover:bg-accent/20'
                } ${!isLoading && !img.isUploading ? 'cursor-move' : 'cursor-default'} ${img.isUploading ? 'opacity-75' : ''}`}
              >
                {/* Drag handle overlay */}
                {!img.isUploading && (
                  <div className="absolute top-2 left-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="bg-background/80 backdrop-blur-sm rounded-md p-1">
                      <GripVerticalIcon className="size-3" aria-hidden="true" />
                    </div>
                  </div>
                )}

                {/* Image preview */}
                <div className="bg-accent flex aspect-square relative items-center justify-center overflow-hidden rounded-t-[inherit]">
                  {img.isUploading || img.preview.startsWith('blob:') ? (
                    // Use regular img for blob URLs (local previews)
                    <img
                      src={img.preview}
                      alt={img.altText}
                      className="size-full rounded-t-[inherit] object-cover"
                    />
                  ) : (
                    // Use Next.js Image for remote URLs
                    <Image
                      src={img.preview}
                      alt={img.altText}
                      fill
                      className="rounded-t-[inherit] object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  )}
                </div>

                {/* Remove button */}
                <Button
                  onClick={() => handleRemove(img.id, !img.isUploading)}
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label={img.isUploading ? "Cancel upload" : "Remove image"}
                  disabled={isLoading && !img.isUploading}
                >
                  <XIcon className="size-3.5" />
                </Button>

                {/* Image info */}
                <div className="flex min-w-0 flex-col gap-0.5 border-t p-3">
                  <p className="truncate text-[13px] font-medium">
                    {img.altText}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {img.isUploading ? (
                      <>{formatBytes(img.size || 0)} - Uploading...</>
                    ) : (
                      img.size ? formatBytes(img.size) : 'No size info'
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove all files button */}
      {productImages.length > 1 && (
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={clearFiles}
            disabled={isLoading}
          >
            Remove all files
          </Button>
        </div>
      )}
    </div>
  )
}
