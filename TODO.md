# Future Enhancements

## Logo Upload Feature

Add optional logo upload during game creation that displays throughout gameplay.

### Requirements

- Add logo upload field to game creation page (`/host/create`)
- Store logo image (consider using Supabase Storage or similar)
- Display logo in header across all views:
  - Host dashboard (`/host/[gameId]`)
  - Display view (`/display/[gameId]`)
  - Player view (`/play/[gameId]`)
- Logo should be optional (games can be created without one)
- Consider image size limits and format restrictions (PNG, JPG, SVG)
- Add logo preview during upload
- Allow logo to be updated/removed after game creation

### Technical Considerations

- Database schema update: Add `logoUrl` field to `games` table
- File storage solution (Supabase Storage recommended)
- Image optimization/resizing for performance
- Responsive design for different screen sizes
- Fallback UI when no logo is present

### Priority

- Low (nice-to-have feature for future release)
