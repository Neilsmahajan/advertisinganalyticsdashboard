export default function PrivacyPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            PRIVACY POLICY
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your personal information when you use our
            services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>
              <span className="font-medium text-foreground">
                Personal Information:
              </span>{" "}
              When you create an account, we collect details such as your name,
              email address, and any other data you provide during registration.
            </li>
            <li>
              <span className="font-medium text-foreground">Usage Data:</span>{" "}
              We track how you interact with our website, including the services
              you use, the pages you visit, and your preferences, to enhance
              your experience.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Ad Platform Data:
              </span>{" "}
              If you connect your ad accounts, we access campaign performance
              metrics, but we never modify or interact with your ad campaigns.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">How We Use Your Information</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We Use Your Information To:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>Provide access to our platform and its features.</li>
            <li>Improve and personalize your experience.</li>
            <li>
              Communicate updates, promotional offers, and support-related
              information.
            </li>
            <li>Maintain the security and integrity of your data.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Data Protection</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We implement industry-standard security measures to safeguard your
            personal information and ad platform data. Your data is encrypted
            and stored securely, and we regularly update our systems to address
            emerging security risks.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Sharing Your Information</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your data with trusted third-party services
            only when necessary for operation, and these parties are required to
            maintain the confidentiality of your information.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Rights</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your Have The Right To:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>Access and update your personal information.</li>
            <li>Delete your account and associated data.</li>
            <li>
              Opt-out of marketing communications by updating your preferences.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Changes To This Policy</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We may update this Privacy Policy periodically. Any changes will be
            posted on this page with an updated revision date.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-gray-500 dark:text-gray-400">
            If you have any questions about this Privacy Policy, please{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
