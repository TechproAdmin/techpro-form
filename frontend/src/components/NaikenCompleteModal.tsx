import React from "react";

interface NaikenCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NaikenCompleteModal = ({ isOpen, onClose }: NaikenCompleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">申し込み完了</h2>
        <p className="mb-6">内見希望を受け付けました。<br />日程が確定したら担当よりご連絡いたします。</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}; 