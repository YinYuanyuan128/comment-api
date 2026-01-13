// Vercel Serverless Function - DeepSeek API 代理
// API Key 安全存储在 Vercel 环境变量中

export default async function handler(req, res) {
  // 设置 CORS 头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  // 从环境变量获取 API Key（安全！）
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 API Key' });
  }

  try {
    const { messages, temperature = 0.85, max_tokens = 800 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '请求格式错误' });
    }

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
        max_tokens,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || data.error.type });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API 调用失败:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
