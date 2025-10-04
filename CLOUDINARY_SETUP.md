# Cloudinary Setup Guide

## 1. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kidstudy_preset
```

## 2. Cloudinary Dashboard Setup

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and create an account.

2. **Get Credentials**: From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

3. **Create Upload Preset**:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Set preset name: `kidstudy_preset`
   - Signing Mode: **Unsigned** (for client-side uploads)
   - Folder: `kidstudy` (optional, to organize files)
   - Allowed formats: `jpg, png, gif, webp, mp3, wav, m4a`
   - Max file size: Set according to your needs (e.g., 10MB for images, 50MB for audio)
   - Click Save

4. **Configure Transformations** (Optional):
   - For images: Auto quality, auto format
   - For audio: Auto quality

## 3. Usage in the Application

### Image Upload Example
```tsx
<CldUploadWidget
  uploadPreset="kidstudy_preset"
  onSuccess={(result) => {
    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
      // Use result.info.secure_url
    }
  }}
>
  {({ open }) => (
    <Button onClick={() => open()}>
      Upload Image
    </Button>
  )}
</CldUploadWidget>
```

### Audio Upload Example
```tsx
<CldUploadWidget
  uploadPreset="kidstudy_preset"
  options={{
    resourceType: 'auto',
    maxFiles: 1,
    clientAllowedFormats: ['mp3', 'wav', 'm4a'],
  }}
  onSuccess={(result) => {
    // Handle audio URL
  }}
>
  {({ open }) => (
    <Button onClick={() => open()}>
      Upload Audio
    </Button>
  )}
</CldUploadWidget>
```

## 4. Security Notes

- **Never expose `CLOUDINARY_API_SECRET`** in client-side code
- Use unsigned presets for client-side uploads
- For sensitive operations, use server-side uploads with API secret
- Consider implementing:
  - File size limits
  - File type restrictions
  - Upload quotas per user

## 5. Testing

1. Check if environment variables are loaded:
   ```js
   console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
   ```

2. Test upload functionality with small test files first

3. Verify uploaded files appear in your Cloudinary Media Library

## 6. Troubleshooting

- **"Upload preset not found"**: Check preset name and ensure it's unsigned
- **"Unauthorized"**: Verify API key and cloud name
- **Files not uploading**: Check browser console for errors, verify network requests
- **CORS issues**: Ensure your domain is whitelisted in Cloudinary settings
