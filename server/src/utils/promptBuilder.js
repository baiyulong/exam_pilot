// AI Prompt 构建器
const promptBuilder = {
  // 选择题生成 Prompt
  buildChoicePrompt(text, count = 10, category = '综合知识') {
    return `你是一位软考高级系统架构设计师考试的辅导老师。
请基于以下文档内容，生成${count}道关于${category}的单项选择题。

要求：
1. 每题4个选项（A/B/C/D），仅1个正确答案
2. 答案需有详细解析
3. 题目需符合软考高级难度标准
4. 必须输出严格JSON格式，不能有其他任何内容（不要markdown代码块标记）

输出格式（JSON数组）：
[{"type":"choice","content":"题目内容","options":[{"label":"A","text":"选项A内容"},{"label":"B","text":"选项B内容"},{"label":"C","text":"选项C内容"},{"label":"D","text":"选项D内容"}],"correct_answer":"A","explanation":"详细解析","category":"${category}","difficulty":3}]

文档内容：
${text.slice(0, 6000)}`;
  },

  // 案例分析题生成 Prompt
  buildCasePrompt(text, category = '架构设计') {
    return `你是一位软考高级系统架构设计师考试的辅导老师。
基于以下架构文档，生成1道案例分析题。

要求：
1. 包含完整的案例背景描述（300-500字）
2. 提出2-3个具体问题
3. 问题需涉及架构选型、性能优化、可靠性设计等
4. 提供答题要点
5. 必须输出严格JSON格式，不能有其他任何内容（不要markdown代码块标记）

输出格式（单个JSON对象）：
{"type":"case","content":"案例分析题","case_background":"完整的案例背景描述...","case_questions":["问题1","问题2","问题3"],"correct_answer":"答题要点：\\n1. ...\\n2. ...","explanation":"参考答案详细说明","category":"${category}","difficulty":4}

文档内容：
${text.slice(0, 6000)}`;
  },

  // 论文写作题生成 Prompt
  buildEssayPrompt(text, category = '架构设计') {
    return `你是一位软考高级系统架构设计师考试的辅导老师。
基于软考系统架构设计师考试要求，生成1道论文写作题目。

要求：
1. 题目应涵盖以下主题之一：微服务架构、云原生、高并发、架构演进、DDD
2. 提供写作要求和评分标准
3. 给出优秀论文结构框架
4. 必须输出严格JSON格式，不能有其他任何内容（不要markdown代码块标记）

输出格式（单个JSON对象）：
{"type":"essay","content":"论文题目","essay_requirements":"写作要求：\\n1. 论文需2500字左右\\n2. 包含摘要(300-400字)和正文\\n3. ...","essay_template":"结构框架：\\n一、摘要\\n二、项目背景\\n三、架构设计\\n四、实施效果\\n五、总结","explanation":"评分标准及写作建议","category":"${category}","difficulty":4}

参考文档内容：
${text.slice(0, 4000)}`;
  },

  // 论文AI批改 Prompt
  buildEssayReviewPrompt(title, abstract, content) {
    return `你是一位软考高级系统架构设计师考试的论文评审专家。
请对以下论文进行批改和评分。

论文题目：${title}

摘要：
${abstract}

正文：
${content}

请从以下维度评分（每项满分15分，总分75分）并给出详细评语：
1. 切题性（是否紧扣主题）
2. 结构完整性（摘要+正文结构是否合理）
3. 技术深度（架构设计是否深入）
4. 项目真实性（是否有真实项目经验体现）
5. 语言表达（文字表达是否清晰流畅）

必须输出严格JSON格式：
{"total_score":60,"dimensions":[{"name":"切题性","score":12,"comment":"评语"},{"name":"结构完整性","score":13,"comment":"评语"},{"name":"技术深度","score":11,"comment":"评语"},{"name":"项目真实性","score":12,"comment":"评语"},{"name":"语言表达","score":12,"comment":"评语"}],"overall_comment":"总体评价","suggestions":["改进建议1","改进建议2","改进建议3"]}`;
  },
};

module.exports = promptBuilder;
