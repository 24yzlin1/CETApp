/**
 * 单词释义数据 - 每个单词的详细解释
 * @typedef MeaningData
 * @property {string} partOfSpeech - 词性 (n-名词, v-动词, a-形容词等)
 * @property {string} meaning - 中文释义
 * @property {string} example - 英文例句
 * @property {string} note - 备注信息 (如特殊用法、搭配等)
 */
export type MeaningData = [
  partOfSpeech: string,
  meaning: string,
  example: string,
  note: string,
];

/**
 * 单词数据 - 单个单词的完整信息
 * @typedef WordData
 * @property {string} word - 英文单词
 * @property {string} phonetic - 音标
 * @property {MeaningData[]} meanings - 释义数组
 */
export type WordData = [
  word: string,
  phonetic: string,
  meanings: MeaningData[],
];

/**
 * 单词索引 - 用于定位单词在列表中的位置
 * @typedef WordIndex
 * @property {number} listIndex - 单词列表索引 (0=CET4, 1=CET6等)
 * @property {number} wordIndex - 单词在列表中的索引
 * @description 例如：[0, 5] 表示CET4列表中的第6个单词（从0开始）
 */
export type WordIndex = [listIndex: number, wordIndex: number];

/**
 * 单词卡片 - 用于展示和学习的基本单元
 * @typedef WordCard
 * @property {WordIndex} index - 单词索引
 * @property {WordData} wordData - 单词详细数据
 */
export type WordCard = [index: WordIndex, wordData: WordData];

/**
 * 收藏元数据 - 用户收藏单词的附加信息
 * @typedef FavoriteMetadata
 * @property {string} collectDate - 收藏日期 (格式: YYYY/MM/DD)
 * @property {number} listIndex - 单词所属列表索引
 */
export type FavoriteMetadata = [collectDate: string, listIndex: number];

/**
 * 收藏数据 - 用户收藏单词信息
 * @typedef FavoriteMetadata
 * @property {string} encodedIndex - 编码后的索引
 * @property {FavoriteMetadata} metadata - 收藏元数据
 */
export type FavoriteData = [encodedIndex: string, metadata: FavoriteMetadata];

/**
 * 进度范围 - 记录用户在某一天的学习进度范围
 * @typedef ProgressRange
 * @property {number} startIndex - 开始学习的单词索引
 * @property {number} endIndex - 结束学习的单词索引 (包含)
 */
export type ProgressRange = [startIndex: number, endIndex: number];

/**
 * 历史学习数据 - 用户每日学习记录
 * @typedef HistoryData
 * @property {string} studyDate - 学习日期 (格式: YYYY/MM/DD)
 * @property {ProgressRange[]} progressRanges - 各单词列表的学习进度范围数组
 * @description 例如：["2024/01/17", [[0, 10], [0, 5]]]
 * 表示2024年1月17日，CET4列表学到了第11个单词(0-10)，CET6列表学到了第6个单词(0-5)
 */
export type HistoryData = [studyDate: string, progressRanges: ProgressRange[]];

/**
 * 用户自定义卡片组
 * @typedef UserCardGroup
 * @property {string} groupName - 卡片组名称
 * @property {string} addDate - 卡片组添加日期
 * @property {WordCard[]} cards - 卡片组包含的单词卡片
 */
export type UserCardGroup = [
  groupName: string,
  addDate: string,
  cards: WordCard[],
];

/**
 * 游戏关卡数据类型
 * @typedef GameLevelData
 * @property {string} correctWordIndex - 正确答案的单词索引编码
 * @property {WordCard[]} correctWordCard - 正确答案的单词卡片
 * @property {number} correctOptionIndex - 正确选项在options数组中的索引
 * @property {string[]} options - 正确选项在options数组中的索引
 */
export type GameLevelData = [
  correctWordIndex: string, // 正确答案的单词索引编码
  correctWordCard: WordCard, // 正确答案的单词卡片
  correctOptionIndex: number, // 正确选项在options数组中的索引
  options: string[], // 选项数组（单词释义）
];

export type MistakeMetadata = [addDate: string, card: WordCard];

export type MistakeData = [level: GameLevelData, metadata: MistakeMetadata];

export type ChatMessage = [role: string, content: string];

export type ChatSessionData = [
  title: string,
  addDate: string,
  addTime: number,
  messages: ChatMessage[],
];
