# Referral System Implementation Guide

## Overview

The referral system allows users to invite friends to the platform. Since only professionals use credits to access leads, the reward system differentiates between customer and professional referrals:

- **Customer Referrals**: Customers can refer other customers to grow the user base (achievements/badges as rewards)
- **Professional Referrals**: Professionals can refer other professionals and earn credits when referrals purchase credits
- **Cross Referrals**: Customers can refer professionals and earn special achievements

## System Architecture

### Database Schema

1. **referral_codes**: Stores unique referral codes for each user
   - Unique 8-character alphanumeric codes
   - Never expire by default
   - One active code per user

2. **referrals**: Tracks referral relationships
   - Links referrer and referred users
   - Tracks status (pending, completed, expired)
   - Records reward credits earned

3. **referral_rewards**: Configurable reward structure
   - Different reward types (signup, purchase, milestones)
   - Credit amounts for each action
   - Can be activated/deactivated

4. **referral_stats**: Aggregated statistics per user
   - Total referrals sent
   - Successful referrals
   - Total credits earned

### Business Logic

#### Referral Flow

1. **Code Generation**
   - User requests referral code via profile page
   - System generates unique 8-character code
   - Code is stored and never expires

2. **Code Sharing**
   - Users share their code via WhatsApp, email, or direct link
   - Link format: `https://domain.com?ref=CODE12345`
   - Built-in sharing buttons in profile

3. **Code Application**
   - New users enter code during registration
   - System validates code exists and isn't expired
   - Creates referral relationship
   - Awards signup bonus to new user (50 credits)

4. **Referral Completion**
   - When referred user makes first purchase
   - System marks referral as completed
   - Awards purchase bonus to referrer (100 credits)
   - Updates referrer statistics

### API Endpoints

- `GET /api/referrals/code` - Get user's referral code
- `GET /api/referrals/stats` - Get referral statistics
- `GET /api/referrals/history` - Get referral history
- `GET /api/referrals/rewards` - Get active reward configuration
- `POST /api/referrals/apply` - Apply referral code
- `POST /api/referrals/complete/:userId` - Complete referral (internal)

### Frontend Components

1. **ReferralShareCard**
   - Displays user's referral code
   - Shows referral statistics
   - Provides sharing buttons
   - Lists program benefits

2. **ReferralHistory**
   - Shows all referred users
   - Displays status and rewards earned
   - Includes timestamps

3. **ReferralApply**
   - Page for entering referral codes
   - Handles URL parameters (?ref=CODE)
   - Shows success/error states

### Integration Points

1. **User Registration**
   - Check for referral code in URL
   - Apply code during signup process
   - Award signup bonus

2. **Payment Processing**
   - Check if user has pending referral
   - Complete referral on first purchase
   - Award purchase bonus to referrer

3. **Profile Page**
   - Display referral section
   - Show code and statistics
   - Enable sharing functionality

## Reward Structure

### Default Rewards

1. **Professional Signup Bonus**
   - New professional receives 25 credits to try the platform
   - Applied immediately on registration with referral code

2. **Professional Purchase Bonus** 
   - Professional referrer receives 100 credits
   - Applied when referred professional makes first credit purchase

3. **Professional Milestone Rewards**
   - 5 successful professional referrals: 250 bonus credits
   - 10 successful professional referrals: 500 bonus credits

4. **Customer Rewards**
   - Customer Ambassador Achievement for referring 5 professionals
   - Special badges for active referrers
   - No credits (customers don't use credits)

### Credit Usage (Professionals Only)

- Credits never expire
- Used by professionals to respond to service requests
- Each response costs 1 credit
- No cash value
- Non-transferable
- Customers do not use credits (free platform for them)

## Implementation Checklist

- [x] Database schema created
- [x] Referral service implemented
- [x] API endpoints created
- [x] Frontend components built
- [x] Profile page integration
- [x] Reward configuration seeded
- [ ] Integration with registration flow
- [ ] Integration with payment system
- [ ] Email notifications for referrals
- [ ] Admin dashboard for referral management

## Best Practices

1. **Security**
   - Validate referral codes server-side
   - Prevent self-referrals
   - Rate limit code generation

2. **User Experience**
   - Make sharing easy with one-click buttons
   - Show clear benefits and rewards
   - Provide real-time statistics

3. **Monitoring**
   - Track referral conversion rates
   - Monitor for abuse patterns
   - Analyze referral sources

## Future Enhancements

1. **Tiered Rewards**
   - Different reward levels based on user type
   - Seasonal promotions
   - Limited-time bonuses

2. **Social Features**
   - Leaderboards for top referrers
   - Social proof notifications
   - Achievement badges

3. **Advanced Analytics**
   - Referral funnel analysis
   - Lifetime value tracking
   - A/B testing different rewards