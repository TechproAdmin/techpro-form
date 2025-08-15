import React from "react";
import type { CAFormData } from "@/types";

interface CACompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  formData: CAFormData | null;
}

export const CACompleteModal = ({ isOpen, onClose, onConfirm, formData }: CACompleteModalProps) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">提出完了</h2>
        <p className="mb-6">同意の内容はメールでもお送りさせていただきます。<br />引き続きよろしくお願い申し上げます。</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}; 