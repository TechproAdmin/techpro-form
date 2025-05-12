import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { toZonedTime } from 'date-fns-tz';

// Request型の拡張
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

const app = express();
app.use(cors());
app.use(express.json());

// multerの設定
const storage = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // 日本語ファイル名をURLエンコードして保存
        const encodedFilename = encodeURIComponent(file.originalname);
        cb(null, `${Date.now()}-${encodedFilename}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // 画像ファイルのみ許可
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('画像ファイルのみアップロード可能です'));
        }
    }
});

const PORT = process.env.PORT || 8080;
const ZAIKO_SS_ID = "10uAVMY4vih_AaGHoWIp4q3J0FXDXTppBa7LHD198CgA";
const FORM_SS_ID = "1Q8rwAR7praYZxLO2ATcOQi6V7VDZ1i8AUjVsSPbuQ7Y"

// Google認証の準備
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ],
  });
  return google.sheets({ version: "v4", auth });
}

async function test() {
    return [
        {
            "id": 1,
            "name": "test",
            "price": 1000
        }
    ]
}

// メール送信用
class Mail {
    private transporter: nodemailer.Transporter;
    private fromAddress: string;

    constructor() {
        this.fromAddress = 'system@techpro-j.com';
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS
            auth: {
                user: this.fromAddress,
                pass: 'kgzl gamu xnsy mnty'
            }
        });
    }

    async sendMail(
        address: string, 
        subject: string, 
        text: string, 
        attachments?: { filename: string; path: string }[]
    ): Promise<void> {
        try {
            const mailOptions = {
                from: this.fromAddress,
                to: address,
                subject: subject,
                text: text,
                date: new Date(),
                attachments: attachments || [] 
            };

            await this.transporter.sendMail(mailOptions);
            await this.transporter.close();
        } catch (error) {
            console.error('メール送信エラー:', error);
            throw error;
        }
    }
}

// 在庫一覧を取得
async function fetchProperties() {
    const sheets = await getSheetsClient();

    // 販売案件
    const sheetSale = await sheets.spreadsheets.values.get({
        spreadsheetId: ZAIKO_SS_ID,
        range: "販売案件!A3:L",
    });
    const dataSale = (sheetSale.data.values || []).map((row: any[]) => ({
        no: row[1], address: row[2], type: row[3], price: row[4], naiken: row[11]
    }));

    // 仲介
    const sheetBroker = await sheets.spreadsheets.values.get({
        spreadsheetId: ZAIKO_SS_ID,
        range: "仲介案件!A3:K",
    });
    const dataBroker = (sheetBroker.data.values || []).map((row: any[]) => ({
        no: row[0], address: row[1], type: row[3], price: row[2], naiken: row[10]
    }));

    return [...dataSale, ...dataBroker];
}

// ルートエンドポイント
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Hello from Cloud Run API!" });
});

// 在庫一覧取得エンドポイント
app.get("/fetch", async (req, res) => {
  const properties = await fetchProperties();
  res.json({ status: "success", message: "在庫一覧を取得しました", properties });
});

// 在庫一覧(内見可のみ)取得エンドポイント
app.get("/fetch_naiken", async (req, res) => {
    const properties = await fetchProperties();
    const properties_naiken = properties.filter((property) => property.naiken === "【内見可】");
    res.json({ status: "success", message: "在庫一覧(内見可)を取得しました", properties: properties_naiken });
})

// 買付申込フォーム送信エンドポイント
app.post("/send_kaitsuke", (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        // conditionsの処理を修正
        let conditionsStr = "";
        if (Array.isArray(formData.conditions)) {
            conditionsStr = formData.conditions.join(", ");
        } else if (typeof formData.conditions === "string") {
            conditionsStr = formData.conditions;
        }

        // 日本時間に変換
        const jstDate = toZonedTime(new Date(), 'Asia/Tokyo');
        const formattedDate = format(jstDate, 'yyyy/MM/dd HH:mm:ss');

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "買付申込フォーム管理表!C:S",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        formattedDate,
                        formData.lastName || "",
                        formData.firstName || "",
                        formData.companyName || "",
                        formData.email || "",
                        formData.phone || "",
                        formData.address || "",
                        formData.media || "",
                        formData.agentName || "",
                        formData.offerPrice || "",
                        formData.deposit || "",
                        formData.loan || "",
                        conditionsStr,
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        formData.propertyType || "",
                        formData.propertyPrice || ""
                    ]
                ]
            }
        });

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

// 内見受付フォーム送信エンドポイント
app.post("/send_naiken", upload.single('imgFile'), (async (req: Request, res: Response) => {
    try {
        const sheets = await getSheetsClient();
        const formData = req.body;
        const file = req.file;

        if (!formData) {
            return res.status(400).json({ status: "error", message: "フォームデータがありません" });
        }

        // 日本時間に変換
        const jstDate = toZonedTime(new Date(), 'Asia/Tokyo');
        const formattedDate = format(jstDate, 'yyyy/MM/dd HH:mm:ss');

        // propertyTypeとpropertyPriceを文字列として処理
        const propertyType = Array.isArray(formData.propertyType) ? formData.propertyType[0] : formData.propertyType;
        const propertyPrice = Array.isArray(formData.propertyPrice) ? formData.propertyPrice[0] : formData.propertyPrice;

        await sheets.spreadsheets.values.append({
            spreadsheetId: FORM_SS_ID,
            range: "内見受付フォーム管理表!C:P",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    [
                        formattedDate,
                        formData.name || "",
                        formData.phone || "",
                        formData.email || "",
                        formData.date1 || "",
                        formData.time1 || "",
                        formData.date2 || "",
                        formData.time2 || "",
                        file ? decodeURIComponent(file.filename) : "",
                        formData.privacy || "",
                        formData.propertyNo || "",
                        formData.propertyAddress || "",
                        propertyType || "",
                        propertyPrice || ""
                    ]
                ]
            }
        });

        // 社内向けメール送信
        const mail = new Mail();
        const mailText = `
内見受付フォームが送信されました。

【送信内容】
名前: ${formData.name}
電話番号: ${formData.phone}
メールアドレス: ${formData.email}
内見希望日①: ${formData.date1} ${formData.time1}
内見希望日②: ${formData.date2} ${formData.time2}
物件番号: ${formData.propertyNo}
物件住所: ${formData.propertyAddress}
物件種別: ${formData.propertyType}
物件価格: ${formData.propertyPrice}
        `;

        await mail.sendMail(
            "support@techpro-j.com",
            "内見受付フォームを受信しました",
            mailText,
            file ? [{
                filename: decodeURIComponent(file.originalname),
                path: file.path
            }] : undefined
        );

        // ファイルの削除（オプション）
        if (file) {
            fs.unlinkSync(file.path);
        }

        res.json({ status: "success", message: "データを記録しました" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", message: "サーバーエラーが発生しました" });
    }
}) as RequestHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
