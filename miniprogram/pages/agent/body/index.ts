import { ChatMessage, ChatSessionData } from "../../../utils/type";
import { defaultGlobalData } from "../../../utils/util";

Component({
  data: {
    isShowPopup: false, // 是否显示弹窗
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

  if (app.globalData.user.llmUrl === "debug") {
    await new Promise((r) => setTimeout(r, 1000));

    if (history[history.length - 1][1].includes("长难句")) {
      return [
        "assistant",
        "# 四六级阅读长难句**秒拆技巧**（最简上手，直接用）\n## 一、核心原则：**砍修饰，留主干**\n句子只分两类：**主干（主谓宾）** + **修饰（全部删掉）**\n做题只看主干，修饰一律跳过\n\n## 二、3步万能拆分法\n### 1. 先划「断开标志」（看到直接切句）\n1. **连词**：and/but/or/because/if/when/while/although\n2. **关系词**：that/which/who/where/whose\n3. **标点**：逗号 , 破折号 —— 冒号 :\n4. **介词**：in/on/at/with/for/of/by（介词开头全是修饰）\n\n### 2. 删掉3种无用修饰（直接划掉不读）\n1. **介词短语**：of… / in… / for… / with…\n2. **分词短语**：doing / done 开头短句\n3. **插入语**：for example、in fact、I think\n\n### 3. 抓唯一主干：**找谓语动词定主谓**\n- 一个句子**只有1个主句谓语**\n- 找到**动词** → 往前找**主语** → 往后找**宾语**\n- 其余全是废话\n\n## 三、超实用口诀\n**见介删短语，见从划从句，\n只剩主谓宾，意思立刻出。**\n\n## 四、高频必拆句式（四六级90%都是这4种）\n### 1. 定语从句（that/which）\n结构：**名词 + that + 句子**\n拆分：名词是主干，that后面全修饰\n例：The book **that you bought** is good\n拆分：The book is good\n\n### 2. 状语从句（because/if/when/although）\n结构：**连词+短句，主句**\n拆分：逗号前全忽略，只读**后半主句**\n\n### 3. 倒装句（阅读最爱考）\n还原顺序：**状语提前 → 换回主谓正常顺序**\nOnly then can we learn = We can learn then\n\n### 4. 非谓语长句（doing/done/to do）\n拆分：**do/to do 不是主句动词**，跳过找真正谓语\n\n## 五、考场极速做题法\n1. 通读句子**只圈动词**\n2. 圈出动词立刻锁定**主语**\n3. 逗号之间内容**全部跳过**\n4. 读懂主干直接做题，不用翻译整句\n\n## 六、极简例句实战\n原句：People living in big cities tend to feel lonely in their daily life.\n拆分：\n删掉修饰：living in big cities / in their daily life\n主干：**People tend to feel lonely.**\n句意：人们容易感到孤独。\n\n## 七、避坑2点\n1. **情态动词+动词**=整体谓语（will do/can do/may do）\n2. 过去式≠过去分词，**过去分词不算主句谓语**\n\n我可以直接拿**四六级真题长难句**带你逐句拆练，要练吗？",
      ];
    }

    if (history[history.length - 1][1].includes("阅读")) {
      return [
        "assistant",
        "# 四六级仔细阅读「定位秒杀五步」\n全程不精读全文，正确率拉满\n\n## 一、通用做题顺序\n1. 先题后文，**只读题干，不读选项**\n2. 题干划关键词 → 原文精准定位 → 比对选项\n3. 题序=行文顺序，**一题一段，顺序不乱**\n\n## 二、五步标准解题法\n### 1. 划题干3类定位词（优先找）\n- **大写/数字/专有名词**（最好定位）\n- **名词、名词短语**（不易同义替换）\n- **动词、形容词**（次选，容易换词）\n❌ 不划：people、we、they、this、these 万能词\n\n### 2. 原文定位原则\n- 原词复现直接锁定句子\n- 找不到原词=**同义替换**，就近找同义表达\n- 定位到**整句**，答案90%就在**本句/前后一句**\n- 定位句过长：立刻用**长难句拆分**抓主干\n\n### 3. 锁定答案范围\n- 细节题：答案**定位句内**\n- 因果题：找 because/so/due to/lead to\n- 观点题：找 sb think/believe/say/argue\n- 推断题：**不瞎脑补**，只推原文明确信息\n\n### 4. 选项三排法（极速排除）\n1. **无中生有**：原文完全没提，直接删\n2. **偷换概念**：词像意不同，主语/对象换掉\n3. **扩大/缩小范围**：部分变全部、全部变个别\n\n### 5. 正确选项2大特征\n- **同义改写**（四六级最爱）\n  important=vital=crucial；solve=deal with\n- **主干一致**：主谓宾和原文完全匹配\n\n---\n\n## 三、4大题型固定解法\n1. **细节题（占70%）**\n定位原句→比对主干→同义替换即为答案\n\n2. **主旨题（首尾题）**\n看**首段尾段+各段首句**，抓高频主题词\n\n3. **态度题**\n抓情感词：\n正面：positive/supportive/approve\n负面：negative/critical/doubtful\n中立：neutral/objective\n\n4. **词义猜测题**\n看前后**转折/并列**逻辑，同近义直接推出\n\n---\n\n## 四、考场绝杀技巧\n1. 选项出现**绝对词**大概率错：\nmust/never/all/only/entirely\n2. 出现**委婉词**正确率高：\nmay/might/could/possible/probably\n3. 原文转折后（but/however/yet）**必是答案**\n4. 两个选项意思几乎一样，直接都排除\n5. 时间不够：优先选**贴合主旨**的选项\n\n---\n\n## 五、最简做题流程口诀\n划词定位，锁定原句\n拆分主干，比对句意\n排除无关，优选替换\n顺序做题，不回通读\n\n需要我给你一套**真题实操带练**，直接带你现场定位做题吗？",
      ];
    }

    if (history[history.length - 1][1].includes("作文")) {
      return [
        "assistant",
        "# 四六级作文万能开头+结尾（直接背，全覆盖）\n## 一、通用开头（90%话题能用）\n1. **现象类最稳**\nNowadays, ... has become increasingly common in our daily life.\n如今，……在日常生活中愈发普遍。\n\n2. **社会热点**\nRecently, there has been a heated discussion about ...\n近来，关于……引发了热烈讨论。\n\n3. **观点类**\nDifferent people hold different views towards ...\n不同人对……持有不同看法。\n\n4. **图表/现状**\nAs is known to all, ... plays an important role in modern society.\n众所周知，……在现代社会举足轻重。\n\n## 二、高分进阶开头\n1. With the rapid development of society, more and more people pay attention to ...\n随着社会快速发展，越来越多人重视……\n2. It is widely acknowledged that ...\n人们普遍认为……\n\n---\n\n## 三、万能结尾（百搭不踩雷）\n1. **总结升华（首选）**\nIn short, we should attach great importance to ...\n总之，我们应当高度重视……\n\n2. **建议呼吁**\nOnly in this way can we have a better future.\n唯有如此，我们才能拥有更好的未来。\n\n3. **展望未来**\nI firmly believe that things will become better and better.\n我坚信一切都会越来越好。\n\n4. **个人表态**\nAs far as I am concerned, it is necessary for us to ...\n在我看来，我们有必要……\n\n## 四、观点对比作文专用\n### 开头\nSome people think that..., while others argue that...\n一些人认为……，然而另一些人认为……\n\n### 结尾\nFrom my point of view, every coin has two sides. We should treat it reasonably.\n在我看来，凡事皆有利弊，我们应理性看待。\n\n## 五、校园/学习类专用\n### 开头\nStudy is of great importance to every student.\n学习对每位学生都至关重要。\n### 结尾\nWe should make full use of time to improve ourselves.\n我们应充分利用时间提升自我。\n\n## 六、环保/健康/生活类\n### 开头\nMore and more people realize the importance of ...\n越来越多人意识到……的重要性。\n### 结尾\nLet us take action to create a better life.\n让我们行动起来，共创美好生活。\n\n## 七、四六级高分过渡句（凑字数+提分）\n1. What’s more,... 此外\n2. In addition,... 另外\n3. On the contrary,... 相反\n4. As a result,... 因此\n5. In my opinion,... 在我看来\n\n## 极简背诵版（考场直接默写）\n**开头**\nNowadays, ... is very common around us. People have different opinions about it.\n**结尾**\nIn a word, we should do our best to deal with it well. I believe our life will be better.\n\n需要我按**书信、议论文、谚语、图表**分开给你专属模板吗？",
      ];
    }

    return [
      "assistant",
      "很抱歉，对于这个问题我暂时无法解答，你可以换个问题提问哦。",
    ];
  }

  return new Promise((r) => {
    wx.request({
      url: app.globalData.user.llmUrl + "/chat/completions",
      method: "POST",
      header: {
        Authorization: "Bearer " + app.globalData.user.llmKey,
        "Content-Type": "application/json",
      },
      data: {
        model: app.globalData.user.llmModel,
        messages: history.map((x) => {
          return {
            role: x[0],
            content: x[1],
          };
        }),
      },
      success: (x: any) => {
        const content = x.data?.choices?.[0]?.message?.content || "";
        r(["assistant", content]);
      },
      fail: (x) => {
        r(["assistant", "请求失败：" + x.errMsg]);
      },
    });
  });
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
      `合并旧记忆与新对话，精简提炼核心信息，去冗余、留关键设定，只输出压缩后的新记忆。旧记忆：${previous}`,
    ],
    ...messages,
  ]);

  return result[1];
}
