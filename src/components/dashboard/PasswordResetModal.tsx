"use client";

import { X, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResend: () => void;
  userEmail: string;
}

export default function PasswordResetModal({
  isOpen,
  onClose,
  onResend,
  userEmail,
}: PasswordResetModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Email Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              {/* Main Message */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">
                  Se ha enviado un correo para restablecer la contraseña al
                  usuario.
                </h3>
                <p className="text-sm text-gray-600">
                  Enviamos el correo a{" "}
                  <span className="font-medium text-gray-900">{userEmail}</span>
                </p>
              </div>

              {/* Resend Code Link */}
              <button
                onClick={onResend}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm underline mb-8"
              >
                Reenviar Código
              </button>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
