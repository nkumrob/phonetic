# Production Deployment Checklist

## Pre-Deployment Verification

### 🔐 Security
- [ ] All security headers implemented and tested
  ```bash
  npm run test:e2e -- security-headers.spec.ts
  ```
- [ ] No console logs in production build
  ```bash
  npm run build && grep -r "console\." .next/
  ```
- [ ] Environment variables configured
- [ ] API rate limiting active
- [ ] CSRF protection enabled
- [ ] Input validation on all forms

### 🚀 Performance
- [ ] Bundle size < 500KB
  ```bash
  npm run analyze
  ```
- [ ] All images optimized
- [ ] Fonts loading with font-display: swap
- [ ] Lazy loading implemented
- [ ] Service worker registered (if PWA)
- [ ] Core Web Vitals passing

### 🧪 Testing
- [ ] All unit tests passing
  ```bash
  npm test
  ```
- [ ] All E2E tests passing
  ```bash
  npm run test:e2e
  ```
- [ ] Manual testing completed on:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
  - [ ] iOS Safari
  - [ ] Android Chrome

### 📱 Responsiveness
- [ ] Mobile layouts verified (320px - 768px)
- [ ] Tablet layouts verified (768px - 1024px)
- [ ] Desktop layouts verified (1024px+)
- [ ] Touch interactions working
- [ ] Keyboard navigation functional

### ♿ Accessibility
- [ ] WCAG AA compliance verified
- [ ] Screen reader tested
- [ ] Keyboard navigation complete
- [ ] Focus indicators visible
- [ ] Color contrast passing

### 🔍 SEO
- [ ] Meta tags present on all pages
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Open Graph tags working
- [ ] Structured data valid

## Vercel Deployment Configuration

### Environment Variables
```env
# .env.production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=verification-code
```

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "framework": "nextjs"
}
```

### Headers Configuration
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Deployment Steps

1. **Final Build Test**
   ```bash
   npm run build
   npm run start
   # Test locally at http://localhost:3000
   ```

2. **Run Full Test Suite**
   ```bash
   npm run test:all
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Post-Deployment Verification**
   - [ ] Site loads correctly
   - [ ] All routes accessible
   - [ ] API endpoints working
   - [ ] Analytics tracking
   - [ ] Error monitoring active
   - [ ] Performance monitoring setup

## Monitoring Setup

### Alerts to Configure
- [ ] Error rate > 1%
- [ ] Response time > 3s
- [ ] Core Web Vitals degradation
- [ ] Bundle size increase > 10%
- [ ] 4xx/5xx errors spike

### Tools to Enable
- [ ] Vercel Analytics
- [ ] Google Analytics
- [ ] Sentry (error tracking)
- [ ] Lighthouse CI
- [ ] Uptime monitoring

## Rollback Plan

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Feature Flags**
   - Critical features behind flags
   - Gradual rollout capability
   - Quick disable mechanism

3. **Database Rollback**
   - N/A (no database)

## Post-Launch Tasks

### Week 1
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix any critical issues

### Week 2
- [ ] Analyze usage patterns
- [ ] Optimize based on real data
- [ ] Plan next features
- [ ] Update documentation

## Sign-off

- [ ] Development Team Lead: ________________
- [ ] QA Lead: ________________
- [ ] Product Owner: ________________
- [ ] Deployment Date: ________________
- [ ] Version: ________________