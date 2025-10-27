import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - ManageMate",
  description: "ManageMate Privacy Policy - How we collect, use, and protect your personal information in compliance with GDPR and EU data protection laws."
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
            ← Back to ManageMate
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">Last updated: October 27, 2025</p>
          </CardHeader>
          
          <CardContent className="prose max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                ManageMate {`("we," "our," or "us")`} operates the ManageMate workforce scheduling platform, 
                including our website and mobile application (collectively, the {`"Service"`}). This Privacy Policy 
                explains how we collect, use, disclose, and protect your personal information when you use our Service.
              </p>
              <p>
                As a Netherlands-based service, we comply with the European {`Union's`} General Data Protection 
                Regulation (GDPR) and Dutch data protection laws.
              </p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Data Controller Information</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Data Controller:</strong></p>
                <p>ManageMate<br />
                Netherlands<br />
                Email: privacy@managemate.app</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Legal Basis for Processing</h2>
              <p className="mb-4">We process your personal data based on:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Contract performance:</strong> To provide scheduling and workforce management services</li>
                <li><strong>Legitimate interests:</strong> For system administration, security, and service improvement</li>
                <li><strong>Consent:</strong> For marketing communications (where applicable)</li>
                <li><strong>Legal obligation:</strong> For tax, employment law, and regulatory compliance</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Information You Provide</h3>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, phone number, employee ID</li>
                <li><strong>Profile Data:</strong> Work availability, job role, department, contact preferences</li>
                <li><strong>Scheduling Data:</strong> Shift preferences, vacation requests, timesheet information</li>
                <li><strong>Communication Data:</strong> Messages sent through our contact forms or support channels</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 Information Automatically Collected</h3>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>Performance Data:</strong> App crashes, load times, feature usage analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Authentication Data</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Login credentials managed through Supabase authentication</li>
                <li>Session tokens and security-related information</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. How We Use Your Information</h2>
              <p className="mb-4">We use your personal data to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide workforce scheduling and management services</li>
                <li>Generate work schedules based on availability and business needs</li>
                <li>Process timesheet and payroll-related information</li>
                <li>Manage vacation and leave requests</li>
                <li>Send work-related notifications and schedule updates</li>
                <li>Provide customer support and technical assistance</li>
                <li>Ensure platform security and prevent unauthorized access</li>
                <li>Comply with employment and tax regulations</li>
                <li>Improve our services through analytics (anonymized when possible)</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Within Your Organization</h3>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li>Managers and administrators can access employee scheduling data</li>
                <li>HR personnel may access profile and timesheet information</li>
                <li>Colleagues may see published work schedules</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 Third-Party Service Providers</h3>
              <p className="mb-2">We share data with trusted service providers who assist in:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database hosting and user authentication</li>
                <li><strong>Gmail/Email Services:</strong> For sending notifications and communications</li>
                <li><strong>Cloud Infrastructure:</strong> For secure data storage and processing</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.3 Legal Requirements</h3>
              <p className="mb-2">We may disclose information when required by:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Dutch or EU legal obligations</li>
                <li>Court orders or government requests</li>
                <li>Protection of our rights or safety of users</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">We retain your personal data for:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Active accounts:</strong> While you remain an active user</li>
                <li><strong>Terminated accounts:</strong> Up to 7 years for employment/tax compliance</li>
                <li><strong>Usage analytics:</strong> Up to 2 years in anonymized form</li>
                <li><strong>Legal compliance:</strong> As required by applicable laws</li>
              </ul>
              <p>You may request earlier deletion subject to legal and contractual obligations.</p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Your GDPR Rights</h2>
              <p className="mb-4">As an EU resident, you have the right to:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit processing of your data in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw consent:</strong> For consent-based processing</li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@managemate.app" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  privacy@managemate.app
                </a>
                .
              </p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Data Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Encryption in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="mb-4">
                Our service providers (including Supabase) may process data outside the EU. We ensure 
                adequate protection through:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Adequacy decisions by the European Commission</li>
                <li>Standard contractual clauses</li>
                <li>Other appropriate safeguards as required by GDPR</li>
              </ul>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Cookies and Tracking</h2>
              <p className="mb-4">We use essential cookies for:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li>User authentication and session management</li>
                <li>Preference storage (theme, language settings)</li>
                <li>Security and fraud prevention</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling essential cookies may 
                limit platform functionality.
              </p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. {"Children's"} Privacy</h2>
              <p>
                ManageMate is designed for workplace use and not intended for individuals under 16. 
                We do not knowingly collect data from children under 16 without parental consent.
              </p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy to reflect service changes or legal requirements. 
                {"We'll"} notify users of material changes via:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Email notification to registered users</li>
                <li>Platform notifications</li>
                <li>Website announcements</li>
              </ul>
              <p className="mt-4">
                Continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="mb-4">For privacy-related questions or to exercise your rights:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <p><strong>Email:</strong> <a href="mailto:privacy@managemate.app" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">privacy@managemate.online</a></p>
                <p><strong>Address:</strong> Netherlands</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold mb-2">Data Protection Authority:</p>
                <p className="mb-2">
                  If {"you're"} unsatisfied with our response, you may file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens):
                </p>
                <p>
                  Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">autoriteitpersoonsgegevens.nl</a><br />
                  Phone: 0900-200 0777
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}