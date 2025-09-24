"use client"

import { useState, useCallback } from "react"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { useFileUpload, formatBytes, type FileWithPreview } from "../hooks/useFileUpload"
import { Button } from "@/components/ui/button"
import {
  createProductImage,
  deleteProductImage,
} from "../actions/images"
import { useProductData } from "../hooks/useProductData"

interface MediaTabProps {
  product: Record<string, any>
}

export function MediaTab({ product: initialProduct }: MediaTabProps) {
  const [isLoading, setIsLoading] = useState(false)

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

  // Initialize with existing product images - handle both image.url AND imagePath
  const initialFiles = productImages
    .filter(img => (img.image && img.image.url) || img.imagePath) // Include images with EITHER image.url OR imagePath
    .map(img => ({
      name: img.image?.id ? `${img.image.id}.${img.image.extension}` : (img.altText || 'image'),
      size: img.image?.filesize || 0,
      type: img.image?.extension ? `image/${img.image.extension}` : 'image/jpeg',
      url: img.image?.url || img.imagePath || '',
      id: img.id,
    }))

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
    initialFiles,
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

        // Remove successfully uploaded files from local state
        successfulUploads.forEach(fileId => {
          removeFile(fileId)
        })

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
          <h3 className="text-sm font-medium">Product Images</h3>
          {productImages
            .filter(img => (img.image && img.image.url) || img.imagePath)
            .map((img) => (
            <div
              key={img.id}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent aspect-square shrink-0 rounded">
                  <img
                    src={img.image?.url || img.imagePath || ''}
                    alt={img.altText || 'Product image'}
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-medium">
                    {img.altText || (img.image?.id ? `${img.image.id}.${img.image.extension}` : 'Product image')}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {img.image?.filesize
                      ? formatBytes(img.image.filesize)
                      : img.imagePath
                        ? img.imagePath
                        : 'No size info'}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => handleRemove(img.id, true)}
                aria-label="Remove image"
                disabled={isLoading}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Local files being uploaded */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploading...</h3>
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3 opacity-75"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent aspect-square shrink-0 rounded">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-medium">
                    {file.file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(file.file.size)} • Uploading...
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => handleRemove(file.id, false)}
                aria-label="Cancel upload"
                disabled={isLoading}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          ))}
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

      <p
        aria-live="polite"
        role="region"
        className="text-muted-foreground mt-2 text-center text-xs"
      >
        Multiple image uploader for product gallery
      </p>
    </div>
  )
}