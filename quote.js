const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\0/g, '').slice(0, max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ message: 'Email service is not configured yet.' });
  }

  const body = req.body || {};
  const honeypot = clean(body.companyWebsite, 200);

  // Bots often fill hidden fields. Return success so they don't retry.
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const propertyType = clean(body.propertyType, 60);
  const project = clean(body.project, 160);
  const location = clean(body.location, 100);
  const timeline = clean(body.timeline, 100);
  const message = clean(body.message, 4000);

  if (!name || !EMAIL_RE.test(email) || !project || message.length < 10) {
    return res.status(400).json({ message: 'Please complete the required fields.' });
  }

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Project location', propertyType || 'Not provided'],
    ['Service needed', project],
    ['City / ZIP', location || 'Not provided'],
    ['Timeline', timeline || 'Not provided'],
  ];

  const htmlRows = rows.map(([label, value]) =>
    `<tr>
      <td style="padding:8px 12px;color:#7b8794;font-weight:700;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;color:#111827">${escapeHtml(value)}</td>
    </tr>`
  ).join('');

  const emailHtml = `
    <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:28px">
      <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="padding:22px 24px;background:#0b1016;color:#fff;border-bottom:4px solid #4da3ff">
          <div style="font-size:12px;letter-spacing:2px;color:#f5c84c;font-weight:700">WATNELM</div>
          <h1 style="margin:8px 0 0;font-size:24px">New quote request</h1>
        </div>
        <div style="padding:20px 12px">
          <table style="width:100%;border-collapse:collapse">${htmlRows}</table>
          <div style="margin:18px 12px 4px;padding:16px;background:#f7f9fb;border-radius:10px">
            <div style="font-size:12px;color:#7b8794;font-weight:700;text-transform:uppercase;letter-spacing:1px">Project details</div>
            <div style="margin-top:8px;color:#111827;white-space:pre-wrap">${escapeHtml(message)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const textBody = `New Watnelm quote request

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Project location: ${propertyType || 'Not provided'}
Service needed: ${project}
City / ZIP: ${location || 'Not provided'}
Timeline: ${timeline || 'Not provided'}

Project details:
${message}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Watnelm-Website/1.0'
      },
      body: JSON.stringify({
        from: 'Watnelm Website <quotes@watnelm.com>',
        to: ['service@watnelm.com'],
        reply_to: email,
        subject: `Quote Request — ${project} — ${name}`,
        html: emailHtml,
        text: textBody
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(502).json({ message: 'We could not send your request right now.' });
    }

    // Send a simple confirmation to the customer. A failure here should not
    // turn a successfully delivered Watnelm lead into an error for the user.
    try {
      const confirmResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Watnelm-Website/1.0'
        },
        body: JSON.stringify({
          from: 'Watnelm <quotes@watnelm.com>',
          to: [email],
          reply_to: 'service@watnelm.com',
          subject: 'We received your Watnelm request',
          html: `
            <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:28px">
              <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
                <div style="padding:22px 24px;background:#0b1016;color:#ffffff;border-bottom:4px solid #4da3ff">
                  <div style="font-size:12px;letter-spacing:2px;color:#f5c84c;font-weight:700">WATNELM</div>
                  <h1 style="margin:8px 0 0;font-size:24px">Request received.</h1>
                </div>
                <div style="padding:24px;color:#111827;line-height:1.6">
                  <p>Hi ${escapeHtml(name)},</p>
                  <p>Thanks for contacting Watnelm. We received your request for <strong>${escapeHtml(project)}</strong> and will review the details you submitted.</p>
                  <p>If you need to add anything, reply to this email and it will go to <strong>service@watnelm.com</strong>.</p>
                  <p style="margin-top:26px">— Watnelm</p>
                </div>
              </div>
            </div>
          `,
          text: `Hi ${name},

Thanks for contacting Watnelm. We received your request for ${project} and will review the details you submitted.

If you need to add anything, reply to this email and it will go to service@watnelm.com.

— Watnelm`
        })
      });

      if (!confirmResponse.ok) {
        const confirmData = await confirmResponse.json().catch(() => ({}));
        console.error('Customer confirmation email error:', confirmData);
      }
    } catch (confirmError) {
      console.error('Customer confirmation email exception:', confirmError);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quote form error:', error);
    return res.status(500).json({ message: 'We could not send your request right now.' });
  }
}
