// api/validate-serial.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let client;

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: '請提供序號。' });
    }

    const serialToCheck = code.trim();

    client = await pool.connect();

    // 查詢序號資訊
    const queryResult = await client.query(
      `SELECT serial_key, duration_minutes, used_at, expires_at, status
       FROM serials
       WHERE serial_key = $1 AND status = 'active'`,
      [serialToCheck]
    );

    if (queryResult.rows.length === 0) {
      return res.status(400).json({ valid: false, message: '序號不存在或已失效。' });
    }

    const serialData = queryResult.rows[0];
    const now = new Date();

    // 檢查固定到期時間 (expires_at)
    if (serialData.expires_at && now > new Date(serialData.expires_at)) {
      return res.status(400).json({ valid: false, message: '序號已過固定效期。' });
    }

    // 檢查首次使用和持續時間
    if (serialData.used_at) {
      if (serialData.duration_minutes !== null) {
        const activationTime = new Date(serialData.used_at);
        const expirationTime = new Date(activationTime.getTime() + serialData.duration_minutes * 60 * 1000);
        if (now > expirationTime) {
          return res.status(400).json({ valid: false, message: '序號已過使用時效。' });
        }
      }
      res.status(200).json({ valid: true });
    } else {
      // 首次使用，更新 used_at
      await client.query(
        `UPDATE serials SET used_at = NOW() WHERE serial_key = $1`,
        [serialToCheck]
      );
      res.status(200).json({ valid: true });
    }

  } catch (error) {
    console.error('[API DB] Error during validation:', error);
    res.status(500).json({ valid: false, message: '伺服器驗證錯誤。' });
  } finally {
    if (client) {
      client.release();
    }
  }
}