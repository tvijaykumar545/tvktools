const PrivacyPolicy = () => {
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide directly, such as your email address and display name when you create an account. We also collect usage data including which tools you use and how often." },
    { title: "How We Use Your Information", content: "We use your information to provide and improve our services, track tool usage for your dashboard, communicate with you about your account, and ensure the security of our platform." },
    { title: "Data Processing", content: "Tool inputs are processed in real-time and are not stored on our servers. Frontend tools process data entirely in your browser. Backend tools send data to our secure n8n workflows for processing and return results immediately." },
    { title: "Data Storage", content: "Account information and usage statistics are stored securely using Supabase with row-level security policies. We do not sell or share your personal data with third parties." },
    { title: "Cookies", content: "We use essential cookies to maintain your session and authentication state. We do not use tracking cookies or third-party advertising cookies." },
    { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data at any time. You can manage your profile information from your dashboard or contact us for account deletion." },
    { title: "Security", content: "We implement industry-standard security measures including encryption, secure authentication, and row-level security policies to protect your data." },
    { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page." },
    { title: "Contact", content: "If you have questions about this privacy policy, please contact us at support@tvktools.com." },
  ];

  return (
    <div className="cyber-grid min-h-screen py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="font-heading text-3xl font-bold text-primary neon-text">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: March 2026</p>

        <div className="mt-8 space-y-8">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-heading text-sm font-bold text-foreground">{i + 1}. {section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
