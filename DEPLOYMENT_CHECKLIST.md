# PortaiLIQ - Deployment Checklist

## Pre-Deployment Verification

### Environment Variables
- [ ] All required env vars configured in Vercel/Cloudflare
- [ ] Supabase URL and keys set
- [ ] Cloudflare Account ID and API Token configured
- [ ] R2 Storage credentials set
- [ ] Brevo API key configured
- [ ] Gumroad API credentials set
- [ ] KV Cache credentials configured
- [ ] AI Provider keys set (Agnes, Google, Cerebras, Groq)

### Database
- [ ] All migrations applied successfully
- [ ] Schema matches expected structure
- [ ] RLS policies configured correctly
- [ ] Test data cleaned up

### Storage
- [ ] R2 bucket created and configured
- [ ] CORS policies set for bucket
- [ ] File size limits enforced
- [ ] Access keys rotated regularly

### Email
- [ ] Brevo sender email verified
- [ ] Email templates customized
- [ ] Test emails sending correctly
- [ ] Rate limits configured

### Security
- [ ] Rate limiting enabled on all APIs
- [ ] File upload validation active
- [ ] CORS policies configured
- [ ] SSL certificates valid
- [ ] Dependencies updated (no known vulnerabilities)

### Performance
- [ ] KV Cache warming tested
- [ ] Database indexes created
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Bundle size optimized

### Testing
- [ ] All unit tests passing
- [ ] Integration tests successful
- [ ] E2E tests green
- [ ] Manual testing completed
- [ ] Load testing performed

### Monitoring
- [ ] Error tracking configured (Sentry/etc)
- [ ] Analytics installed
- [ ] Health check endpoint active
- [ ] Logging configured
- [ ] Alert rules set up

## Deployment Steps

1. **Build**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm run start
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Verify Deployment**
   - [ ] Homepage loads
   - [ ] Auth flows work
   - [ ] Portal creation works
   - [ ] File upload works
   - [ ] Email notifications work
   - [ ] Payment flow works
   - [ ] Export CSV works

5. **Post-Deployment**
   - [ ] DNS configured
   - [ ] Custom domain pointed
   - [ ] SSL certificate active
   - [ ] Monitoring alerts configured
   - [ ] Backup strategy in place

## Rollback Plan

If issues occur:
1. Identify the problematic deployment
2. Roll back to previous stable version
3. Investigate and fix issues
4. Re-deploy with fixes

---

**Last Updated**: 2026-01-19  
**Deployed By**: [Your Name]  
**Environment**: Production
