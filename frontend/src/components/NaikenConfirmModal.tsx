import type { NaikenFormData } from "@/types";

interface NaikenConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: NaikenFormData | null;
  isSubmitting?: boolean;
}

export const NaikenConfirmModal = ({ isOpen, onClose, onConfirm, formData, isSubmitting }: NaikenConfirmModalProps) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">入力内容の確認</h2>
        <p className="mb-4">以下の内容で内見を申し込みます。</p>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold">内見希望者情報</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>氏名：</div>
              <div>{formData.lastName} {formData.firstName}</div>
              <div>法人名：</div>
              <div>{formData.companyName}</div>
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
          {formData.imgFile && (
            <div>
              <h3 className="font-bold">添付ファイル</h3>
              <div>{formData.imgFile.name}</div>
            </div>
          )}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "申し込む"}
          </button>
        </div>

        {isSubmitting && (
          <div className="mt-6 flex items-center justify-center bg-blue-200 border-2 border-blue-400 p-2 rounded-md">
            <p className="text-sm">送信処理中です...この処理には30秒程度かかる場合がございます。<br />恐れ入りますが、完了するまでこのままお待ちください。</p>
          </div>
        )}
      </div>
    </div>
  );
}; 