const axios = require('axios');
require('dotenv').config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async callLLM(prompt, maxTokens = 4000) {
    try {
      const response = await axios.post(
        `${this.apiBase}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: '你是软考高级系统架构设计师考试辅导专家。请严格按照用户要求的JSON格式输出，不要包含任何其他文字。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 60000,
        }
      );

      const content = response.data.choices[0].message.content.trim();
      return this.parseJSON(content);
    } catch (err) {
      if (err.response) {
        throw new Error(`AI服务调用失败: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      }
      throw new Error(`AI服务调用失败: ${err.message}`);
    }
  }

  parseJSON(text) {
    // 尝试去除markdown代码块标记
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // 尝试提取JSON数组或对象
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);

    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (e) { /* fall through */ }
    }

    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e) { /* fall through */ }
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error('AI返回的内容无法解析为JSON格式');
    }
  }
}

module.exports = new AIService();
