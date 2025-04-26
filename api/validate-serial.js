// api/validate-serial.js
import pkg from 'pg';
const { Pool } = pkg;

// 從環境變數讀取資料庫連接 URL
// Vercel Postgres 會自動設定這些變數，優先使用 non-pooling URL
const connectionString = process.env.POSTGRES_URL_NON_POOLING;

// 建立資料庫連接池
// 注意：在 Serverless 環境中，每次請求可能建立新連接，
// 但 pg Pool 會處理一些底層細節。對於高流量，可能需要更複雜的管理。
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Vercel Postgres 通常需要這個設定
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let client; // 資料庫客戶端變數

  try {
    const { serial } = req.body;

    if (!serial) {
      return res.status(400).json({ valid: false, message: '請提供序號。' });
    }

    const serialToCheck = serial.trim().toUpperCase();

    // 從連接池獲取一個客戶端
    client = await pool.connect();

    // 查詢序號資訊
    const queryResult = await client.query(
      `SELECT code, duration_minutes, activated_at, expires_at, is_active
       FROM serials
       WHERE code = $1`,
      [serialToCheck]
    );

    if (queryResult.rows.length === 0) {
      // 序號不存在
      console.log(`[API DB] Serial not found: ${serialToCheck}`);
      return res.status(400).json({ valid: false, message: '序號不存在。' });
    }

    const serialData = queryResult.rows[0];

    // 檢查是否有效 (is_active)
    if (!serialData.is_active) {
      console.log(`[API DB] Serial inactive: ${serialToCheck}`);
      return res.status(400).json({ valid: false, message: '序號已被停用。' });
    }

    const now = new Date(); // 目前時間

    // 檢查固定到期時間 (expires_at)
    if (serialData.expires_at && now > new Date(serialData.expires_at)) {
      console.log(`[API DB] Serial expired (fixed date): ${serialToCheck}`);
      return res.status(400).json({ valid: false, message: '序號已過固定效期。' });
    }

    // 檢查首次啟用和持續時間
    if (serialData.activated_at) {
      // 非首次啟用，檢查持續時間
      if (serialData.duration_minutes !== null) {
        const activationTime = new Date(serialData.activated_at);
        const expirationTime = new Date(activationTime.getTime() + serialData.duration_minutes * 60 * 1000); // 加上毫秒

        if (now > expirationTime) {
          console.log(`[API DB] Serial expired (duration): ${serialToCheck}`);
          return res.status(400).json({ valid: false, message: '序號已過使用時效。' });
        }
      }
      // 如果 duration_minutes 是 null，且已啟用，則只要沒過 expires_at 就有效
      console.log(`[API DB] Serial validation success (already activated): ${serialToCheck}`);
      res.status(200).json({ valid: true });

    } else {
      // 首次啟用
      console.log(`[API DB] First activation for: ${serialToCheck}`);

      // 更新 activated_at 為目前時間
      await client.query(
        `UPDATE serials SET activated_at = NOW() WHERE code = $1`,
        [serialToCheck]
      );
      console.log(`[API DB] Activated_at updated for: ${serialToCheck}`);

      // 首次啟用一定是有效的（前面已檢查 is_active 和 expires_at）
      res.status(200).json({ valid: true });
    }

  } catch (error) {
    console.error('[API DB] Error during validation:', error);
    res.status(500).json({ valid: false, message: '伺服器驗證錯誤。' });
  } finally {
    // 無論成功或失敗，都要釋放資料庫客戶端回連接池
    if (client) {
      client.release();
    }
  }
} 