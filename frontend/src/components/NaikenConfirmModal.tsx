import type { NaikenFormData } from "@/types";

interface NaikenConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: NaikenFormData | null;
}

export const NaikenConfirmModal = ({ isOpen, onClose, onConfirm, formData }: NaikenConfirmModalProps) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">入力内容の確認</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">内見希望者情報</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>氏名：</div>
              <div>{formData.name}</div>
              <div>電話番号：</div>
              <div>{formData.phone}</div>
              <div>メールアドレス：</div>
              <div>{formData.email}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold">内見希望物件</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>物件：</div>
              <div>{formData.property.no} {formData.property.address}</div>
              <div>種別：</div>
              <div>{formData.property.type}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold">内見希望日</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>第1希望日：</div>
              <div>{formData.date1} {formData.time1}</div>
              <div>第2希望日：</div>
              <div>{formData.date2} {formData.time2}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold">プライバシーポリシー同意</h3>
            <div>{formData.privacy ? "同意する" : "同意しない"}</div>
          </div>
          <div>
            <h3 className="font-bold">添付ファイル</h3>
            <div>{formData.imgFile ? (typeof formData.imgFile === 'string' ? formData.imgFile : formData.imgFile.name) : "未添付"}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            修正する
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            送信する
          </button>
        </div>
      </div>
    </div>
  );
}; 