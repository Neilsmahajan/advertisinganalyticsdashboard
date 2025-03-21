export default function TermsPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            TERMS OF SERVICE
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            Welcome to our Advertising Analytics Dashboard. Please review these
            Terms of Service carefully before using our platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
          <p className="text-gray-500 dark:text-gray-400">
            By accessing and using our services, you agree to be bound by these
            terms. If you do not agree, please refrain from using our platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">User Responsibilities</h2>
          <p className="text-gray-500 dark:text-gray-400">
            You are responsible for maintaining the confidentiality of your
            account information and for all activities that occur under your
            account.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Modifications to the Service</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We reserve the right to modify or discontinue the service at any
            time without prior notice.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Limitation of Liability</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Our dashboard is provided on an "as is" basis. We are not liable for
            any direct, indirect, incidental, or consequential damages arising
            from the use of our services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Changes to These Terms</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We may update these Terms of Service periodically. Continued use of
            the service constitutes acceptance of the updated terms.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-gray-500 dark:text-gray-400">
            If you have any questions about these Terms of Service, please
            <a href="/contact" className="text-primary hover:underline">
              {" "}
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
