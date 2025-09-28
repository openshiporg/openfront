"use client"

import { useState, useCallback } from "react"
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

      setIsLoading(true)
      const successfulUploads: string[] = []

      try {
        // Upload each file
        for (const fileWithPreview of addedFiles) {
          const file = fileWithPreview.file as File // New files will always be File objects
          const result = await createProductImage({
            image: file,
            altText: file.name,
            productId: currentProduct.id,
          })

          if (result.success) {
            toast.success(`${file.name} uploaded successfully`)
            successfulUploads.push(fileWithPreview.id) // Track successful uploads
          } else {
            toast.error(`Failed to upload ${file.name}: ${result.error}`)
          }
        }

        // Clear all files from local state after successful uploads
        clearFiles()

        // Refresh the product data to get updated images
        refetch()
      } catch (error) {
        console.error('Error uploading images:', error)
        toast.error('Failed to upload images')
      } finally {
        setIsLoading(false)
      }
    }
  })

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
        .filter(img => (img.image && img.image.url) || img.imagePath)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      // Find the indices
      const draggedIndex = orderedImages.findIndex(img => img.id === draggedItem)
      const targetIndex = orderedImages.findIndex(img => img.id === targetImageId)

      if (draggedIndex === -1 || targetIndex === -1) {
        throw new Error('Invalid drag operation')
      }

      // Create new array with reordered items
      const newOrder = [...orderedImages]
      const draggedImage = newOrder[draggedIndex]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedImage)

      // Create order updates with new indices
      const orderUpdates = newOrder.map((img, index) => ({
        id: img.id,
        order: index
      }))

      // Call the update function
      const result = await updateProductImagesOrder(currentProduct.id, orderUpdates)

      if (result.success) {
        toast.success('Image order updated successfully')
        refetch() // Refresh the product data
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
          // Refresh the product data to get updated images
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
      // Just remove from local state for new uploads
      removeFile(fileId)
    }
  }, [currentProduct?.id, removeFile, refetch])

  // Show loading state while fetching product data - AFTER all hooks are declared
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

      {/* Current product images from server */}
      {productImages.filter(img => (img.image && img.image.url) || img.imagePath).length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-base font-medium">Product Images</h3>
            <span className="text-xs uppercase opacity-60">Drag to reorder</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {productImages
              .filter(img => (img.image && img.image.url) || img.imagePath)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((img) => (
              <div
                key={img.id}
                draggable={!isLoading}
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
                } ${!isLoading ? 'cursor-move' : 'cursor-default'}`}
              >
                {/* Drag handle overlay */}
                <div className="absolute top-2 left-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="bg-background/80 backdrop-blur-sm rounded-md p-1">
                    <GripVerticalIcon className="size-3" aria-hidden="true" />
                  </div>
                </div>

                {/* Image preview */}
                <div className="bg-accent flex aspect-square items-center justify-center overflow-hidden rounded-t-[inherit]">
                  <img
                    src={img.image?.url || img.imagePath || ''}
                    alt={img.altText || 'Product image'}
                    className="size-full rounded-t-[inherit] object-cover"
                  />
                </div>

                {/* Remove button */}
                <Button
                  onClick={() => handleRemove(img.id, true)}
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label="Remove image"
                  disabled={isLoading}
                >
                  <XIcon className="size-3.5" />
                </Button>

                {/* Image info */}
                <div className="flex min-w-0 flex-col gap-0.5 border-t p-3">
                  <p className="truncate text-[13px] font-medium">
                    {img.altText || (img.image?.id ? `${img.image.id}.${img.image.extension}` : 'Product image')}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {img.image?.filesize
                      ? formatBytes(img.image.filesize)
                      : img.imagePath
                        ? img.imagePath
                        : 'No size info'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local files being uploaded */}
      {files.length > 0 && files.some(file => file.file instanceof File) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploading...</h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {files.filter(file => file.file instanceof File).map((file) => (
              <div
                key={file.id}
                className="bg-background relative flex flex-col rounded-md border opacity-75"
              >
                {/* Image preview */}
                <div className="bg-accent flex aspect-square items-center justify-center overflow-hidden rounded-t-[inherit]">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-full rounded-t-[inherit] object-cover"
                  />
                </div>

                {/* Cancel upload button */}
                <Button
                  onClick={() => handleRemove(file.id, false)}
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label="Cancel upload"
                  disabled={isLoading}
                >
                  <XIcon className="size-3.5" />
                </Button>

                {/* File info */}
                <div className="flex min-w-0 flex-col gap-0.5 border-t p-3">
                  <p className="truncate text-[13px] font-medium">
                    {file.file.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {formatBytes(file.file.size)} • Uploading...
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