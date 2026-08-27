WATNELM WEBSITE — BRAND REFRESH / V3

Brand direction:
- Charcoal / black base
- Metallic silver / white
- Electric blue primary accent
- Small yellow highlights
- Selected Watnelm W / Ethernet mark
- RJ45 T568B conductor colors incorporated in the homepage network visual

Pages:
- index.html
- services.html
- about.html
- contact.html

Contact:
service@watnelm.com

Business positioning:
- Watnelm established in 2023
- Nearly 20 years of low-voltage / technical field experience
- 18 years of customer service experience
- Licensed for security installation in North Carolina
- Cat5e / Cat6, RJ45 termination, fiber installation/splicing/termination,
  RG6/RG11 coax, networking/server work, security, diagnostics
- Automotive technical experience included in About page
- No AT&T dealer/vendor/partner claims

Deployment:
Upload/commit this folder's contents to the root of the watnelm-website GitHub repository.
Vercel will redeploy automatically if the repository is connected to the production project.

Google Workspace:
Do not change or delete Google Workspace MX records. Website DNS and Workspace email records can coexist.


QUOTE FORM — V4
---------------
This build replaces the mailto contact form with a real Vercel serverless form.

Required setup:
1. Create a free Resend account.
2. Add/verify watnelm.com in Resend.
3. Add the DNS records Resend gives you in Squarespace DNS.
   IMPORTANT: do not remove Google Workspace MX records.
4. Create a Resend API key.
5. In Vercel > Watnelm project > Settings > Environment Variables:
   Name: RESEND_API_KEY
   Value: your Resend API key
   Environment: Production (and Preview if desired)
6. Redeploy after adding the variable.

Form delivery:
- From: quotes@watnelm.com
- To: service@watnelm.com
- Reply-To: customer's email address

The website does not expose the Resend API key to visitors.
