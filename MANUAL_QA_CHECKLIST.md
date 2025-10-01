# Flash Sale Carousel - Manual QA Checklist

## Database Setup
- [ ] Run migration SQL in Supabase dashboard
- [ ] Verify discounts table created with proper constraints
- [ ] Test RLS policies work correctly
- [ ] Verify unique index prevents overlapping discounts

## Admin Functionality
- [ ] Navigate to admin product detail page
- [ ] Click "Add Discount" button
- [ ] Create percentage discount (e.g., 20%)
- [ ] Set start date to today, end date to tomorrow
- [ ] Enable "Feature on Landing Page"
- [ ] Save discount successfully
- [ ] Verify discount appears in list with correct preview
- [ ] Edit existing discount
- [ ] Delete discount
- [ ] Test validation (negative values, invalid dates, overlapping discounts)

## Flash Sale Carousel
- [ ] Home page shows carousel when FLASH_SALE_ENABLED=true
- [ ] Carousel displays featured discounts only
- [ ] Cards show correct pricing (original price struck through, sale price)
- [ ] Percent off badge displays correctly
- [ ] Countdown timer shows time remaining
- [ ] Countdown updates every second
- [ ] Add to cart button works
- [ ] Clicking product navigates to product detail
- [ ] Carousel is responsive (mobile, tablet, desktop)
- [ ] Keyboard navigation works
- [ ] Pause/play button works
- [ ] Pagination dots work

## Cart Integration
- [ ] Add flash sale item to cart
- [ ] Verify cart shows sale price, not original price
- [ ] Checkout with sale price
- [ ] Verify order total uses sale price

## Feature Flag
- [ ] Set FLASH_SALE_ENABLED=false
- [ ] Verify home page shows original hero section
- [ ] Set FLASH_SALE_ENABLED=true
- [ ] Verify home page shows flash sale carousel

## Edge Cases
- [ ] No active discounts - carousel should be hidden
- [ ] Discount expires while viewing - countdown should show 00:00:00
- [ ] Discount expires between add to cart and checkout - should fall back to base price
- [ ] Invalid discount data - should handle gracefully
- [ ] Network error - should show appropriate error state

## Performance
- [ ] Carousel loads quickly (< 2 seconds)
- [ ] Images lazy load properly
- [ ] No console warnings
- [ ] Smooth scrolling and animations

## Accessibility
- [ ] Screen reader can navigate carousel
- [ ] Focus indicators visible
- [ ] Color contrast meets AA standards
- [ ] Pause/play button has proper labels

## Analytics
- [ ] Check console for flash_sale_impression events
- [ ] Check console for flash_sale_click events  
- [ ] Check console for flash_sale_add_to_cart events
- [ ] Verify events include correct itemId and position data











