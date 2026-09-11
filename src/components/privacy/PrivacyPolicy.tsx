import React, { useEffect } from 'react';
import {
  Calendar,
  Heart,
  ShieldCheck,
  Lock,
  Database,
  ExternalLink,
  ArrowLeft,
  Mail,
  CheckCircle2,
  EyeOff,
  Server,
  RefreshCw,
  UserCheck,
  FileText,
} from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy - Yimly FamilyCal';
  }, []);

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div id="privacy-policy-page" className="min-h-screen bg-[#0B0D13] text-gray-200 font-sans selection:bg-[#FF4FA3] selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0E111A]/90 backdrop-blur-md border-b border-[#242C3D]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A202C] border border-[#242C3D] flex items-center justify-center shadow-sm">
            <div className="relative">
              <Calendar className="w-5 h-5 text-[#FF4FA3]" />
              <Heart className="w-2.5 h-2.5 text-white fill-white absolute -bottom-0.5 -right-0.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight font-serif">
                Yimly FamilyCal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF4FA3]/15 text-[#FF4FA3] text-[10px] font-bold">
                Privacy Policy
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Self-Hosted Family Calendar & Organizer</p>
          </div>
        </div>

        <button
          onClick={handleReturn}
          id="privacy-return-button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-200 hover:text-white border border-[#242C3D] text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF4FA3]" />
          <span>Return to App</span>
        </button>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Policy Intro Hero */}
        <section className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1A202C] border border-[#242C3D] flex items-center justify-center shrink-0 shadow-sm text-[#FF4FA3]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Effective Date: <strong className="text-white">September 11, 2026</strong> &bull; Version 1.0.0
              </p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                This Privacy Policy describes how <strong className="text-white">Yimly FamilyCal</strong> handles, stores, and protects personal information and calendar data. We are committed to transparency, data ownership, and strict privacy principles.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#242C3D] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <Server className="w-4 h-4 shrink-0" />
              <span>Self-Hosted & Local Storage</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>Zero Tracking or Advertising</span>
            </div>
            <div className="flex items-center gap-2 text-[#FF4FA3] bg-[#FF4FA3]/10 border border-[#FF4FA3]/20 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Google API Limited Use Adherent</span>
            </div>
          </div>
        </section>

        {/* Section 1: Introduction */}
        <section id="section-introduction" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">1. Introduction</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-white">Yimly FamilyCal</strong> is a private, family-centric calendar and household organizer available at{' '}
            <a href="https://familycal.robinhort.link" className="text-[#FF4FA3] hover:underline">
              https://familycal.robinhort.link
            </a>
            . It allows household members to coordinate schedules, track chores and tasks, celebrate birthdays, and optionally synchronize their individual schedules with Google Calendar.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Because Yimly FamilyCal is designed for families and self-hosted environments, your household data is stored on your designated server or container instance. We do not operate a centralized advertising platform or monetize your personal schedules.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section id="section-information-collected" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <Database className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">2. Information We Collect</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            FamilyCal only stores information that is strictly necessary to provide calendar and household management features. This includes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#1A202C] border border-[#242C3D] p-4 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#FF4FA3]">
                Account & Member Details
              </h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>Name and household member display names</li>
                <li>Email address used for account sign-in</li>
                <li>Cryptographic password hash (salted using bcrypt, never plain text)</li>
                <li>Optional member birthdays and avatar color assignments</li>
                <li>Family household name</li>
              </ul>
            </div>

            <div className="bg-[#1A202C] border border-[#242C3D] p-4 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#FF4FA3]">
                Household & Calendar Content
              </h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>Event titles, descriptions, locations, and timestamps</li>
                <li>Recurring event schedules and recurrence rules</li>
                <li>Task and chore descriptions, due dates, and completion statuses</li>
                <li>Assigned member associations for events and tasks</li>
              </ul>
            </div>

            <div className="bg-[#1A202C] border border-[#242C3D] p-4 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#FF4FA3]">
                Authentication & Session Tokens
              </h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>HTTP-only session tokens for maintaining verified family logins</li>
                <li>Session expiration timestamps and security tokens</li>
              </ul>
            </div>

            <div className="bg-[#1A202C] border border-[#242C3D] p-4 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#FF4FA3]">
                Connected Google Calendar Data
              </h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>Google account email and account identifier</li>
                <li>OAuth 2.0 access and refresh tokens</li>
                <li>Synchronized calendar events and external calendar IDs</li>
                <li><em>Only stored when Google Calendar integration is explicitly enabled</em></li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-[#1A202C]/60 border border-[#242C3D] text-xs text-gray-400">
            <strong className="text-white">What We Do NOT Collect:</strong> Yimly FamilyCal does NOT collect financial or payment card data, device fingerprinting, advertising identifiers, tracking cookies, or browsing history outside of the application.
          </div>
        </section>

        {/* Section 3: Google Calendar Integration & Limited Use Disclosure */}
        <section id="section-google-calendar" className="bg-[#121620] border border-[#FF4FA3]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl relative">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <RefreshCw className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">3. Google Calendar Integration</h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#FF4FA3]/10 border border-[#FF4FA3]/30 text-xs text-gray-200 leading-relaxed">
            <strong className="text-white font-bold block mb-1 text-sm">Google API Limited Use Disclosure:</strong>
            Yimly FamilyCal's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4FA3] underline font-semibold hover:text-white inline-flex items-center gap-0.5"
            >
              Google API Services User Data Policy
              <ExternalLink className="w-3 h-3" />
            </a>
            , including the Limited Use requirements.
          </div>

          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              Yimly FamilyCal provides an <strong className="text-white">optional</strong> integration with Google Calendar. This feature allows family members to connect their individual Google Calendar accounts so that their personal schedules appear alongside family events on the shared household board.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Explicit User Authorization:</strong> We will never access your Google Calendar without your direct consent. You must explicitly click "Connect Google Calendar" and approve the OAuth 2.0 consent dialog presented by Google.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Scope of Access:</strong> FamilyCal requests access to the Google Calendar API (<code className="text-xs bg-[#1A202C] px-1.5 py-0.5 rounded text-pink-300">calendar.events</code> and <code className="text-xs bg-[#1A202C] px-1.5 py-0.5 rounded text-pink-300">calendar.readonly</code>) solely to retrieve your scheduled events and push events created in FamilyCal to your Google Calendar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Strict Purpose Limitation:</strong> Google user data and calendar entries are used exclusively to provide the calendar synchronization feature you requested.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No Third-Party Sharing:</strong> We do not transfer, disclose, or sell Google user data to third parties, advertising networks, data brokers, or marketing platforms.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No AI Model Training:</strong> Google user data is NEVER used to train, retrain, or improve generalized machine learning, foundation, or artificial intelligence models.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No Human Reading:</strong> No human beings read or inspect your Google Calendar data unless you explicitly request technical support for a sync error, or when required by applicable law.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: How We Use Information */}
        <section id="section-how-we-use-information" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">4. How We Use Information</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            All data collected by Yimly FamilyCal is utilized strictly to provide core household management features:
          </p>
          <ul className="text-xs sm:text-sm text-gray-300 space-y-2 list-disc list-inside">
            <li>Displaying day, week, month, and agenda views of family schedules.</li>
            <li>Tracking household task assignments, chores, and completion statuses.</li>
            <li>Displaying reminders for birthdays and recurring annual milestones.</li>
            <li>Authenticating household members and protecting unauthorized access.</li>
            <li>Synchronizing authorized calendars with Google Calendar when enabled by the user.</li>
          </ul>
        </section>

        {/* Section 5: Data Storage, Security & Retention */}
        <section id="section-data-storage" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <Server className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">5. Data Storage, Security & Retention</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              <strong className="text-white">Self-Hosted Architecture:</strong> Yimly FamilyCal stores application state inside an isolated SQLite database file (<code className="text-xs bg-[#1A202C] px-1.5 py-0.5 rounded text-pink-300">/data/family_calendar.sqlite</code>) residing within the user's persistent Docker volume (<code className="text-xs bg-[#1A202C] px-1.5 py-0.5 rounded text-pink-300">yimly_data</code>).
            </p>
            <p>
              <strong className="text-white">Security Safeguards:</strong>
            </p>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-1.5 list-disc list-inside">
              <li>All user passwords are encrypted with salted one-way hashing algorithms (bcrypt).</li>
              <li>Authentication cookies utilize secure, HTTP-only flags.</li>
              <li>Google OAuth tokens are stored locally in the database and refreshed directly through Google's OAuth endpoints.</li>
              <li>External network traffic is protected via encrypted HTTPS tunnels (Cloudflare Tunnel).</li>
            </ul>
            <p>
              <strong className="text-white">Retention Period:</strong> Data remains stored on your instance as long as you maintain your FamilyCal installation. You can remove individual events, tasks, or members at any time through the application interface.
            </p>
          </div>
        </section>

        {/* Section 6: Data Sharing & Third Parties */}
        <section id="section-third-parties" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <EyeOff className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">6. Data Sharing & Third Parties</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-white">We do not sell, rent, or monetize your personal or household data under any circumstances.</strong>
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Yimly FamilyCal operates without commercial advertising networks, third-party behavioral trackers, or external marketing integrations. The only third-party service that FamilyCal interfaces with is Google APIs, and only when a user explicitly initiates and authorizes Google Calendar synchronization.
          </p>
        </section>

        {/* Section 7: User Controls & Revocation */}
        <section id="section-user-controls" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <UserCheck className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">7. User Control, Revocation & Deletion</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            You retain complete control over your household data and third-party integrations:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="p-3.5 rounded-2xl bg-[#1A202C] border border-[#242C3D]">
              <strong className="text-white block mb-1">Disconnecting Google Calendar from FamilyCal:</strong>
              Navigate to <strong className="text-[#FF4FA3]">Settings &rarr; Google Calendar Integration</strong> in Yimly FamilyCal and click <strong className="text-red-400">Disconnect</strong>. This immediately removes stored Google OAuth tokens and stops synchronization.
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1A202C] border border-[#242C3D]">
              <strong className="text-white block mb-1">Revoking Access Through Google:</strong>
              You can revoke Yimly FamilyCal's access directly at any time through your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4FA3] underline inline-flex items-center gap-0.5"
              >
                Google Account Third-Party Access Settings
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1A202C] border border-[#242C3D]">
              <strong className="text-white block mb-1">Data Deletion & JSON Backup:</strong>
              Household administrators can export complete calendar backups or purge events directly from the Settings view.
            </div>
          </div>
        </section>

        {/* Section 8: Children's Privacy */}
        <section id="section-children" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-3 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <Heart className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">8. Children's Privacy</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Yimly FamilyCal is designed as a collaborative household application. Account creation and system administration must be conducted by parents or legal guardians. We do not knowingly solicit or collect personal information directly from children without parental configuration.
          </p>
        </section>

        {/* Section 9: Updates to Policy */}
        <section id="section-updates" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-3 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">9. Changes to This Privacy Policy</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in functionality, operational practices, or legal requirements. Any modifications will be posted directly to this page with an updated "Effective Date".
          </p>
        </section>

        {/* Section 10: Contact Information */}
        <section id="section-contact" className="bg-[#121620] border border-[#242C3D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-[#FF4FA3]">
            <Mail className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white">10. Contact Information</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            If you have questions, inquiries, or feedback regarding this Privacy Policy or how your calendar data is handled, please contact:
          </p>

          <div className="bg-[#1A202C] border border-[#242C3D] rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-bold text-white w-28">Application:</span>
              <span>Yimly FamilyCal</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-bold text-white w-28">Website:</span>
              <a href="https://familycal.robinhort.link" className="text-[#FF4FA3] hover:underline">
                https://familycal.robinhort.link
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-bold text-white w-28">Privacy URL:</span>
              <a href="https://familycal.robinhort.link/privacy" className="text-[#FF4FA3] hover:underline">
                https://familycal.robinhort.link/privacy
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="font-bold text-white w-28">Contact Email:</span>
              <a href="mailto:yimlyapp@gmail.com" className="text-[#FF4FA3] hover:underline font-semibold">
                yimlyapp@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-[#242C3D]/60 text-xs text-gray-500 space-y-2">
          <p>&copy; {new Date().getFullYear()} Yimly FamilyCal &bull; Dedicated to private household organization.</p>
          <div>
            <button
              onClick={handleReturn}
              className="text-[#FF4FA3] hover:underline font-semibold cursor-pointer"
            >
              &larr; Return to Yimly FamilyCal
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
