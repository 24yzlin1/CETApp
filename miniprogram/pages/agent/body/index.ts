Component({
  data: {
    inputText: "牛顿第一定律是否适用于所有参考系？",
    loading: false,
    history: Array<ChatMessage>(),
    historyDisplay: Array<{
      role: string;
      content: {
        type: string;
        data: string;
      }[];
    }>(),
  },

  lifetimes: {
    attached() {
      const basePrompt =
        "你是一位专业、耐心的英语学习助手。\n你的任务是帮助用户学习英语，包括但不限于：单词讲解、语法解析、句子翻译、写作批改、口语练习、阅读理解、发音指导、例句造句等。\n\n请遵守以下规则：\n1. 用中文为主进行讲解，关键英文术语可附带英文。\n2. 解释通俗易懂，避免过于学术化、复杂的表达。\n3. 翻译时：\n   - 英译中：准确、自然、符合中文表达习惯\n   - 中译英：地道、简洁、符合日常/书面场景\n4. 遇到句子、作文、对话，先指出错误，再给出修改版本，并简单说明原因。\n5. 提供例句时尽量贴近生活、实用，可附带场景说明。\n6. 不闲聊无关内容，始终围绕英语学习提供帮助。\n7. 语气友好、鼓励，适合学生长期使用。\n8. 如果用户只给一个单词，自动提供：音标、词性、中文意思、常用搭配、例句。";

      this.setData({
        history: [["system", basePrompt]],
      });
    },
  },

  observers: {
    history() {
      this.setData({
        historyDisplay: this.data.history.map((x) => {
          return {
            role: x[0],
            content: [
              {
                type: "markdown",
                data: x[1],
              },
            ],
          };
        }),
      });

      console.log(this.data);
    },
  },

  methods: {
    async sendHandle() {
      const userMessage: ChatMessage = ["user", this.data.inputText];
      this.setData({
        inputText: "牛顿第一定律是否适用于所有参考系？",
        loading: true,
        history: [...this.data.history, userMessage],
      });

      const agentMessage = await callLlm(this.data.history);
      this.setData({
        loading: false,
        history: [...this.data.history, agentMessage],
      });
    },
  },
});

type ChatMessage = [role: string, content: string];

async function callLlm(history: ChatMessage[]): Promise<ChatMessage> {
  const app = getApp();
  let raw: any;

  wx.request({
    url: app.globalData.user.llmUrl,
    method: "POST",
    header: {
      Authorization: app.globalData.user.llmKey,
      "Content-Type": "application/json",
    },
    data: {
      model: app.globalData.user.llmModel,
      messages: history,
    },
    success: (response) => (raw = response.data),
  });

  await new Promise((r) => setTimeout(r, 1000));

  return [
    "assistant",
    raw !== undefined
      ? raw.choices[0].message.content
      : "不，牛顿第一定律并不适用于所有参考系。它只适用于惯性参考系。",
  ];
}
