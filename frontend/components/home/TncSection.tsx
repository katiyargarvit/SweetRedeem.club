// ============================================================
// TncSection — Terms & Conditions footer block
// ============================================================

export default function TncSection() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA', padding: '16px 18px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 8 }}>
        Terms &amp; Conditions
      </p>
      <p style={{ fontSize: 11, color: '#666', lineHeight: 1.7 }}>
        All point valuations on SweetRedeem.club are estimates based on publicly available data and
        community reports. Actual redemption values may vary. We are not affiliated with any bank,
        credit card issuer, or loyalty programme. Always verify award availability before transferring
        points — point transfers are irreversible. SweetRedeem.club is for informational purposes only
        and does not constitute financial or travel advice. By using this app you agree to our full Terms of Use.
      </p>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        {['Privacy Policy', 'Terms of Use', 'Contact Us', 'About'].map((link) => (
          <span
            key={link}
            style={{ fontSize: 11, color: '#C5A059', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            {link}
          </span>
        ))}
      </div>
      <p style={{ fontSize: 10, color: '#999', marginTop: 10 }}>
        © 2026 SweetRedeem.club · Made with ♥ for points nerds
      </p>
    </div>
  );
}
