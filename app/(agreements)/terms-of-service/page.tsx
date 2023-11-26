import Link from "next/link";

const Page = () => {
  return (
    <main
      style={{
        width: "98.85vw",
        background: "white",
        color: "black",
        padding: "20px",
      }}
    >
      <title>Terms of Service</title>
      <h1>Terms of Service</h1>
      <h2>1. Introduction</h2>
      <p>
        Welcome to WhisperNet, a chat application that allows users to
        communicate with others and create group chats with multiple people. By
        using this application, you agree to comply with and be bound by the
        following terms of service. Please review these carefully before using
        the application.
      </p>

      <h2>2. Intellectual Property Rights</h2>
      <p>
        Unless otherwise indicated, all materials, including but not limited to
        text, graphics, images, and other content provided in this app, are
        owned by or licensed to the owner, Jesse Ogunlaja. These materials are
        protected by intellectual property laws, including but not limited to
        copyright, trademark, patent, and trade secret laws. You may not
        reproduce, distribute, modify, display, perform, or use any of these
        materials without the prior written consent of the owner, Jesse
        Ogunlaja.
      </p>

      <h2>3. User Conduct</h2>
      <p>
        Users are solely responsible for the content they post, including text,
        images, and any other media shared through the app. WhisperNet does not
        claim ownership of any content that users post. However, by posting any
        content on the app, you grant WhisperNet a worldwide, non-exclusive,
        royalty-free, transferable license to use, reproduce, distribute,
        prepare derivative works of, display, and perform that content in
        connection with the service provided by the application.
      </p>

      <h2>4. Privacy Policy</h2>
      <p>
        Our Privacy Policy outlines how we collect, use, and disclose
        information from users. By using this app, you agree to the terms
        outlined in the Privacy Policy. Please review the Privacy Policy{" "}
        <Link href="/privacy-policy">here</Link>.
      </p>

      <h2>5. Disclaimer</h2>
      <p>
        WhisperNet is not responsible for any content shared between users.
        Users are advised to use the app responsibly and within the legal limits
        of their respective jurisdictions. WhisperNet does not endorse, support,
        represent, or guarantee the completeness, truthfulness, accuracy, or
        reliability of any content posted by users.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        WhisperNet shall not be liable for any direct, indirect, incidental,
        consequential, or punitive damages arising out of the use or inability
        to use this app. This includes but is not limited to damages for loss of
        profits, data, use, or other intangible losses, even if WhisperNet has
        been advised of the possibility of such damages.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These Terms of Service are governed by and construed in accordance with
        the laws of the United Kingdom. Any legal action or proceeding related
        to this application shall be brought exclusively in a court of competent
        jurisdiction in the United Kingdom.
      </p>

      <h2>8. Changes to Terms of Service</h2>
      <p>
        WhisperNet reserves the right to modify these Terms of Service at any
        time. Users will be notified of any changes via the app or through other
        means of communication. Continued use of the app after such
        modifications will constitute acknowledgment and acceptance of the
        modified terms of service.
      </p>

      <h2>9. Contact Information</h2>
      <p>
        If you have any questions about these Terms of Service, please contact
        us at jesseogunlaja@gmail.com.
      </p>
    </main>
  );
};

export default Page;
