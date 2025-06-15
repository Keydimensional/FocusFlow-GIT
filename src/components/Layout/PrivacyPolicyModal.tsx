import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Privacy Policy</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-sm max-w-none">
              <div className="mb-4 text-sm text-gray-600">
                <strong>Last updated:</strong> 14 June 2025
              </div>

              <p className="text-gray-700 mb-6">
                BrainBounce is committed to protecting your privacy and being transparent about how your data is handled. 
                This policy outlines what information we collect, how we use it, and your rights regarding your data.
              </p>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h3>
                <p className="text-gray-700 mb-3">
                  To provide a personalised and seamless experience, BrainBounce collects the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Anonymous usage data:</strong> Includes device type, feature use, and crash reports.
                  </li>
                  <li>
                    <strong>Cloud-synced app data:</strong> Your goals, tasks, mood check-ins and similar content are stored securely in the cloud, 
                    linked to a unique anonymous user ID, allowing you to access them across devices.
                  </li>
                  <li>
                    <strong>Advertising data:</strong> Google AdSense may collect cookie and IP address information to serve relevant ads.
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  We do not collect or store personal information like names or email addresses unless explicitly provided by you.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Use of Google AdSense</h3>
                <p className="text-gray-700 mb-3">
                  BrainBounce uses Google AdSense to show ads. Google may use cookies or similar technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Display personalised ads based on your browsing history</li>
                  <li>Display non-personalised ads based on general information such as location</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  You can read more about how Google handles this data{' '}
                  <a 
                    href="https://policies.google.com/technologies/partner-sites" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                  >
                    here
                    <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Data Storage and Security</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Your app data is encrypted and stored securely in the cloud.</li>
                  <li>All synced data is tied to an anonymous account ID, not personal identifiers.</li>
                  <li>No sensitive information is shared or sold to third parties.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Your Rights</h3>
                <p className="text-gray-700 mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access your app data across multiple devices</li>
                  <li>Request full deletion of your data at any time</li>
                  <li>
                    Opt out of personalised ads via{' '}
                    <a 
                      href="https://adssettings.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                    >
                      Google Ad Settings
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Contact</h3>
                <p className="text-gray-700 mb-3">
                  If you have any questions about this privacy policy or your data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a 
                      href="mailto:brainbounce@mail.com" 
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      brainbounce@mail.com
                    </a>
                  </li>
                  <li>
                    <strong>Website:</strong>{' '}
                    <a 
                      href="https://brainbounce.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
                    >
                      https://brainbounce.app
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Fixed Footer with Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};