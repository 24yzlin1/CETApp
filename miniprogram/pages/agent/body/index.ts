import { ChatMessage, ChatSessionData } from "../../../utils/type";
import { defaultGlobalData } from "../../../utils/util";

Component({
  data: {
    isShowPopup: false,
    isShowMemory: false,
    inputText: "",
    exampleInput: [
      "教我四六级阅读长难句拆分技巧",
      "四六级仔细阅读定位解题步骤",
      "给我四六级作文万能开头结尾模板",
    ],
    loading: false,
    title: "",
    sessions: Array<ChatSessionData>(),
    sessionIndex: -1,
    agentMemory: "",
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
      const app = getApp();
      this.setData({
        sessions: app.globalData.agent.sessions,
        agentMemory: app.globalData.agent.memory,
      });
      this.newChatHandle();
    },
    async detached() {
      const app = getApp();
      app.globalData.agent.sessions = this.data.sessions.filter(
        (x) => x[0] !== "新聊天",
      );
      app.globalData.agent.memory = await updateMemory(
        this.data.agentMemory,
        this.data.sessions,
      );
    },
  },

  observers: {
    sessionIndex(x: number) {
      const session = this.data.sessions[x];
      this.setData({ title: session[0], history: session[3] });
    },
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
    },
  },

  methods: {
    backHandle() {
      wx.navigateBack();
    },
    showMemoryHandle() {
      this.setData({ isShowMemory: !this.data.isShowMemory });
    },
    popupShowHandle() {
      this.setData({ isShowPopup: true });
    },
    popupHideHandle() {
      this.setData({ isShowPopup: false });
    },
    newChatHandle() {
      const basePrompt =
        "你是专业英语学习AI助手，负责帮用户背单词、练口语、讲语法、改句子，讲解通俗不晦涩，贴合日常实用学习。";
      const sessions: ChatSessionData[] = [
        [
          "新聊天",
          new Date().toDateString(),
          new Date().getTime(),
          [["system", basePrompt]],
        ],
        ...this.data.sessions,
      ];
      this.setData({
        sessionIndex: 0,
        sessions: sessions,
      });
    },
    saveSessionHandle() {
      const sessions: ChatSessionData[] = this.data.sessions;
      sessions[this.data.sessionIndex][0] = this.data.title.substring(0, 16);
      sessions[this.data.sessionIndex][3] = this.data.history;
      this.setData({ sessions: sessions });
    },
    changeSessionHandle(e: { currentTarget: { dataset: { target: number } } }) {
      this.setData({ sessionIndex: e.currentTarget.dataset.target });
    },
    removeSessionHandle() {
      this.setData({ sessions: [] });
      this.newChatHandle();
    },
    inputChangeHandle(e: { detail: { value: any } }) {
      this.setData({ inputText: e.detail.value });
    },
    resetMemoryHandle() {
      this.setData({ agentMemory: JSON.parse(defaultGlobalData).agent.memory });
    },
    async exampleTapHandle(e: {
      currentTarget: { dataset: { target: number } };
    }) {
      this.setData({
        inputText: this.data.exampleInput[e.currentTarget.dataset.target],
      });
      await this.sendHandle();
    },
    async sendHandle() {
      if (this.data.history.length === 1) {
        this.setData({ title: this.data.inputText });
      }
      const userMessage: ChatMessage = ["user", this.data.inputText];
      this.setData({
        inputText: "",
        loading: true,
        history: [...this.data.history, userMessage],
      });
      const agentMessage = await callLlm(this.data.history);
      this.setData({
        loading: false,
        history: [...this.data.history, agentMessage],
      });
      this.saveSessionHandle();
    },
  },
});

async function callLlm(history: ChatMessage[]): Promise<ChatMessage> {
  const app = getApp();
  let response: any;
  let error: string = "";

  if (app.globalData.user.llmUrl === "debug") {
    await new Promise((r) => setTimeout(r, 1000));
    if (history[history.length - 1][1].includes("长难句")) {
      return [
        "assistant",
        "# 四六级阅读长难句**秒拆技巧**（最简上手，直接用）\n## 一、核心原则：**砍修饰，留主干**\n句子只分两类：**主干（主谓宾）** + **修饰（全部删掉）**\n做题只看主干，修饰一律跳过\n\n## 二、3步万能拆分法\n### 1. 先划介词短语\n圈出以下关键词及后面的内容：\n- **in/on/at/for/to/with/by/about/of/from**\n- **which/that/who**引导的从句\n### 2. 再找连词\n划掉 **and/but/or/so/because/although** 连接的并列句或从句，只看主句\n### 3. 最后读主干\n剩下部分就是：**谁 + 做了什么 + 对谁**\n\n## 三、真题案例实战\n**原句**\nThe study, which was conducted by researchers at Harvard University, found that students who participated in the program showed significant improvement in their reading skills.\n\n**拆分**\n1. 划掉 `, which was conducted by researchers at Harvard University,`（定语从句，修饰study）\n2. 划掉 `that students who participated in the program`（宾语从句+定语从句）\n3. 划掉 `in their reading skills`（介词短语）\n**主干** → The study found showed significant improvement.\n研究显示有显著提升。\n\n---\n\n## 四、考场绝杀技巧\n1. 选项出现**绝对词**大概率错：must/never/all/only/entirely\n2. 出现**委婉词**正确率高：may/might/could/possible/probably\n3. 原文转折后（but/however/yet）**必是答案**\n4. 两个选项意思几乎一样，直接都排除\n5. 时间不够：优先选**贴合主旨**的选项\n\n---\n需要我给你一套**真题实操带练**吗？",
      ];
    }
    if (history[history.length - 1][1].includes("作文")) {
      return [
        "assistant",
        "# 四六级作文万能开头+结尾（直接背，全覆盖）\n## 一、通用开头\n1. **现象类**\nNowadays, ... has become increasingly common.\n如今，……在日常生活中愈发普遍。\n\n2. **社会热点**\nRecently, there has been a heated discussion about ...\n近来，关于……引发了热烈讨论。\n\n3. **观点类**\nDifferent people hold different views towards ...\n不同人对……持有不同看法。\n\n## 二、万能结尾\n1. **总结升华**\nIn short, we should attach great importance to ...\n总之，我们应当高度重视……\n\n2. **建议呼吁**\nOnly in this way can we have a better future.\n唯有如此，我们才能拥有更好的未来。\n\n3. **展望未来**\nI firmly believe that things will become better and better.\n我坚信一切都会越来越好。\n\n## 三、四六级高分过渡句\n1. What's more,... 此外\n2. In addition,... 另外\n3. On the contrary,... 相反\n4. As a result,... 因此\n5. In my opinion,... 在我看来\n\n需要我按**书信、议论文、谚语、图表**分开给你专属模板吗？",
      ];
    }
    return [
      "assistant",
      "很抱歉，对于这个问题我暂时无法解答，你可以换个问题提问哦。",
    ];
  }

  wx.request({
    url: app.globalData.user.llmUrl + "/chat/completions",
    method: "POST",
    header: {
      Authorization: "Bearer " + app.globalData.user.llmKey,
      "Content-Type": "application/json",
    },
    data: {
      model: app.globalData.user.llmModel,
      messages: history,
    },
    success: (x) => (response = x.data),
    fail: (x) => (error = x.errMsg),
  });

  return [
    "assistant",
    response !== undefined ? response.choices[0].message.content : error,
  ];
}

async function updateMemory(
  previous: string,
  sessions: ChatSessionData[],
): Promise<string> {
  const messages = sessions
    .flatMap((x) => x[3])
    .filter((x) => x[0] !== "system");
  const result = await callLlm([
    [
      "system",
      "合并旧记忆与新对话，精简提炼核心信息，去冗余、留关键设定，只输出压缩后的新记忆。旧记忆：" +
        previous,
    ],
    ["user", JSON.stringify(messages)],
  ]);
  return result[1];
}
