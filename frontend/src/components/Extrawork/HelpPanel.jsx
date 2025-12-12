import React from "react";

const HelpPanel = () => {
  const email = "samvaad.help@gmail.com";

  return (
    <div className="flex flex-col text-black dark:text-white items-start justify-start w-full h-full px-5 py-1 overflow-y-auto">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-6">Help</h2>

      {/* Version Info */}
      <div className="mb-8">
        <p className="text-lg font-medium">Samvaad for All</p>
        <p className="text-sm mt-1">Version 1.0000.0.0</p>
      </div>

      <hr className="w-full border mb-8" />

      {/* Contact Section */}
      <div className="mb-8">
        <h3 className="text-base font-medium mb-2">Contact us</h3>
        <p className="text-sm mb-3">
          We'd like to know your thoughts about this app.
        </p>

        <div className="flex flex-col gap-2">
          <a href={`mailto:${email}`}>
            <button className="text-cyan-500 hover:underline text-sm w-fit">
              Contact us
            </button>
          </a>

          <a href={`mailto:${email}`}>
            <button className="text-cyan-500 hover:underline text-sm w-fit">
              Rate the web
            </button>
          </a>
        </div>
      </div>

      <hr className="w-full border mb-8" />

      {/* Links */}
      <div className="flex flex-col gap-3 text-sm">
        <a href={`mailto:${email}`}>
          <button className="text-cyan-500 hover:underline text-left">
            Help center
          </button>
        </a>

        <a href={`mailto:${email}`}>
          <button className="text-cyan-500 hover:underline text-left">
            Licenses
          </button>
        </a>

        <a href={`mailto:${email}`}>
          <button className="text-cyan-500 hover:underline text-left">
            Terms and Privacy Policy
          </button>
        </a>
      </div>

      <div className="flex-grow" />

      {/* Footer */}
      <div className="mb-32 text-xs text-gray-200">© 2025 Samvaad Inc.</div>
    </div>
  );
};

export default HelpPanel;
