import React from "react";

interface KaitsukeCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KaitsukeCompleteModal = ({ isOpen, onClose }: KaitsukeCompleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">申し込み完了</h2>
        <div className="mb-6">
          買付申込を受け付けました。<br />
          担当よりご連絡いたします。<br /><br />
          
          <p className="font-bold text-green-500">＊＊＊＊＊＊＊＊＊＊</p>

          LINE公式アカウント「利回り20%倶楽部」にも<br />ぜひご登録ください！<br />
          "現況利回り20%"を原則の基準にして特選物件を<br />ご紹介する無料のサービスです！<br />
          さらに、厳選された高積算物件やおすすめ情報も<br />お届けいたします！<br />

          <p className="font-bold text-green-500">＊＊＊＊＊＊＊＊＊＊</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            閉じる
          </button>
          <button
            onClick={() => window.open("https://lin.ee/Y8UqyPI", "_blank")}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            LINE登録する
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs">LINE登録はこちらのQRコードからも可能です</p>
          <img src="/officialLineQR.png" alt="LINE" className="w-1/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}; 