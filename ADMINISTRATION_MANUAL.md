# Administration Manual - ServiciosHogar.com.ar

## 🔧 Platform Administration Guide

### Overview
This manual covers all administrative tasks for managing the ServiciosHogar.com.ar platform, including user management, content administration, system monitoring, and maintenance procedures.

## 📊 Admin Dashboard Access

### Login Credentials
- **URL**: https://servicioshogar.com.ar/admin
- **Access Level**: Administrator privileges required
- **Authentication**: JWT-based session management

### Dashboard Features
1. **User Management** - View and manage all users (clients and providers)
2. **Service Management** - Add, edit, and remove services
3. **Booking Management** - Monitor and manage all reservations
4. **Financial Reports** - Track payments and revenue
5. **System Analytics** - Platform usage statistics
6. **Content Management** - Update site content and settings

## 👥 User Management

### Managing Users

#### View All Users
```bash
# API endpoint to list users
GET /api/admin/users
```

#### User Types
- **Clients**: Regular users who book services
- **Providers**: Service providers who offer services
- **Admins**: Platform administrators

#### User Actions
1. **Activate/Deactivate Users**
   - Navigate to Users → User List
   - Click user profile → Account Status
   - Toggle Active/Inactive status

2. **Reset User Passwords**
   - Go to Users → Password Reset
   - Enter user email
   - System sends reset link

3. **Upgrade User to Provider**
   - Users → User Profile → Account Type
   - Change from "Client" to "Provider"
   - User gains access to provider dashboard

4. **Ban/Suspend Users**
   - For policy violations
   - Temporary or permanent suspension
   - Includes reason and duration

### Provider Verification

#### Provider Approval Process
1. **Documents Review**
   - Identity verification
   - Professional certifications
   - Insurance documentation

2. **Service Validation**
   - Verify service categories
   - Check pricing reasonableness
   - Validate service descriptions

3. **Background Check**
   - Reference verification
   - Previous client reviews
   - Professional standing

#### Approval Actions
```bash
# Approve provider
PUT /api/admin/providers/{id}/approve

# Reject provider application
PUT /api/admin/providers/{id}/reject
```

## 🛍️ Service Management

### Adding New Services

#### Service Categories
- **Limpieza**: Domestic cleaning services
- **Jardinería**: Garden and landscape services
- **Plomería**: Plumbing services
- **Electricidad**: Electrical services
- **Pintura**: Painting services
- **Reparaciones**: General repairs

#### Creating a Service
1. Navigate to Services → Add New Service
2. Fill required fields:
   - Service name
   - Category
   - Description
   - Base price range
   - Duration estimate
   - Required skills/certifications

3. Set availability parameters:
   - Days of the week
   - Time slots
   - Advance booking requirements

### Service Pricing Management

#### Pricing Structure
- **Base Price**: Minimum service cost
- **Variable Pricing**: Based on complexity/duration
- **Provider Markup**: Provider-specific adjustments
- **Platform Fee**: Commission percentage

#### Price Validation
- Ensure competitive pricing
- Monitor market rates
- Approve pricing changes
- Handle price disputes

## 📅 Booking Management

### Monitoring Reservations

#### Booking Status Types
- **Pending**: Awaiting provider confirmation
- **Confirmed**: Provider accepted booking
- **In Progress**: Service being performed
- **Completed**: Service finished
- **Cancelled**: Booking cancelled
- **Disputed**: Issue reported

#### Admin Actions for Bookings
1. **Manual Booking Creation**
   - For phone/email requests
   - Emergency bookings
   - VIP customer requests

2. **Conflict Resolution**
   - Handle booking disputes
   - Reschedule conflicts
   - Refund processing

3. **Quality Assurance**
   - Follow up on completed services
   - Monitor service quality
   - Handle complaints

### Booking Analytics
```bash
# Get booking statistics
GET /api/admin/analytics/bookings

# Response includes:
# - Total bookings per month
# - Completion rates
# - Customer satisfaction scores
# - Revenue per service category
```

## 💰 Financial Management

### Payment Processing

#### Payment Methods Supported
- **MercadoPago**: Primary payment processor
- **Bank Transfer**: For large transactions
- **Cash**: For local services (limited)

#### Financial Monitoring
1. **Revenue Tracking**
   - Daily/weekly/monthly reports
   - Service category breakdown
   - Provider commission tracking

2. **Payment Disputes**
   - Handle refund requests
   - Process chargebacks
   - Resolve payment failures

3. **Commission Management**
   - Set platform commission rates
   - Track provider earnings
   - Process payouts

### Financial Reports

#### Monthly Report Contents
- Total platform revenue
- Number of transactions
- Average transaction value
- Top performing services
- Provider earnings summary
- Failed payment analysis

#### Export Options
```bash
# Generate financial report
GET /api/admin/reports/financial?month=2024-01&format=csv
```

## 🔍 System Monitoring

### Performance Monitoring

#### Key Metrics to Monitor
1. **Server Performance**
   - Response times
   - Error rates
   - Database query performance
   - Memory usage

2. **User Experience**
   - Page load times
   - Search functionality
   - Booking completion rates
   - Mobile responsiveness

3. **Business Metrics**
   - User acquisition
   - Retention rates
   - Service completion rates
   - Customer satisfaction

### System Health Checks

#### Daily Monitoring Tasks
```bash
# Check backend health
curl https://servicioshogar-backend.onrender.com/api/health

# Verify database connectivity
npm run db:check

# Test payment processing
npm run test:payments
```

#### Weekly Monitoring Tasks
- Review error logs
- Analyze performance metrics
- Check security alerts
- Update system dependencies

## 🛡️ Security Administration

### Security Monitoring

#### Authentication Security
- Monitor failed login attempts
- Track suspicious user activity
- Manage session timeouts
- Review API access patterns

#### Data Protection
- Ensure GDPR compliance
- Monitor data access logs
- Handle data deletion requests
- Backup verification

### Security Incident Response

#### Incident Types
1. **Unauthorized Access**
   - Immediate account suspension
   - Security audit
   - Password reset enforcement

2. **Data Breaches**
   - Immediate containment
   - User notification
   - Security enhancement

3. **Payment Fraud**
   - Transaction investigation
   - Provider verification
   - Financial institution notification

## 🔄 Content Management

### Website Content Updates

#### Editable Content Areas
- Homepage banners
- Service descriptions
- Pricing information
- Terms of service
- Privacy policy
- Help documentation

#### Content Update Process
1. Access admin panel
2. Navigate to Content Management
3. Select content area to edit
4. Use rich text editor for changes
5. Preview changes
6. Publish updates

### SEO Management

#### SEO Tasks
- Update meta descriptions
- Manage keywords
- Optimize service pages
- Monitor search rankings
- Update sitemap

## 📧 Communication Management

### Email System Administration

#### Email Types
- **Welcome emails**: New user registration
- **Booking confirmations**: Service bookings
- **Reminders**: Upcoming appointments
- **Notifications**: System updates
- **Marketing**: Promotional campaigns

#### Email Template Management
```bash
# Update email templates
PUT /api/admin/email-templates/{type}

# Test email delivery
POST /api/admin/test-email
```

### Notification Management

#### Push Notifications
- Booking confirmations
- Payment confirmations
- Service reminders
- System announcements

#### SMS Notifications
- Booking confirmations
- Emergency notifications
- Verification codes

## 🚨 Emergency Procedures

### System Downtime Response

#### Emergency Contacts
- **Technical Support**: Backend issues
- **Hosting Provider**: Server problems
- **Payment Processor**: Payment issues
- **Database Provider**: Database problems

#### Emergency Response Steps
1. **Assess Impact**
   - Identify affected services
   - Estimate user impact
   - Determine urgency level

2. **Immediate Response**
   - Communicate with users
   - Implement temporary solutions
   - Contact technical support

3. **Recovery Process**
   - Execute recovery procedures
   - Verify system functionality
   - Monitor for additional issues

### Data Recovery

#### Backup Procedures
- **Database**: Daily automated backups (Neon)
- **Application**: Git repository backup
- **User data**: Weekly exports
- **Financial data**: Daily backups

#### Recovery Steps
```bash
# Database recovery (if needed)
npm run db:restore --backup-date=2024-01-15

# Verify data integrity
npm run db:verify
```

## 📈 Analytics and Reporting

### Platform Analytics

#### User Analytics
- Registration trends
- User engagement metrics
- Service usage patterns
- Geographic distribution

#### Business Analytics
- Revenue trends
- Service popularity
- Provider performance
- Market penetration

### Report Generation

#### Automated Reports
- Daily summary reports
- Weekly performance reports
- Monthly business reports
- Quarterly financial reports

#### Custom Reports
```bash
# Generate custom report
POST /api/admin/reports/custom
{
  "dateRange": "2024-01-01 to 2024-01-31",
  "metrics": ["revenue", "bookings", "users"],
  "format": "csv"
}
```

## 🔧 Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Tasks
- [ ] Check system health status
- [ ] Review error logs
- [ ] Monitor payment processing
- [ ] Verify backup completion

#### Weekly Tasks
- [ ] Update system dependencies
- [ ] Review user feedback
- [ ] Analyze performance metrics
- [ ] Check security alerts

#### Monthly Tasks
- [ ] Generate financial reports
- [ ] Review provider performance
- [ ] Update content and policies
- [ ] Plan system improvements

### System Updates

#### Update Process
1. **Staging Environment Testing**
   - Deploy updates to staging
   - Run comprehensive tests
   - Verify functionality

2. **Production Deployment**
   - Schedule maintenance window
   - Deploy updates
   - Monitor system performance

3. **Post-Update Verification**
   - Test critical functions
   - Monitor error rates
   - Verify user experience

---

## 📞 Support and Escalation

### Support Levels
1. **Level 1**: Basic user support
2. **Level 2**: Technical issues
3. **Level 3**: System administration
4. **Level 4**: Emergency response

### Contact Information
- **Technical Support**: tech@servicioshogar.com.ar
- **Business Support**: admin@servicioshogar.com.ar
- **Emergency Contact**: +54-11-XXXX-XXXX

---

**This administration manual should be reviewed and updated quarterly to ensure accuracy and completeness.**