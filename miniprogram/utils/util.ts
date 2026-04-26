import {
  FavoriteData,
  FavoriteMetadata,
  HistoryData,
  MistakeData,
  UserCardGroup,
  WordCard,
  WordIndex,
} from "./type";
import { wordList } from "./word_list";

/**
 * 收藏夹工具类 - 管理单词收藏功能
 * @class FavoriteUtil
 * @description 提供收藏单词的检查、添加、删除和转换功能
 */
export class FavoriteUtil {
  /**
   * 检查单词是否已被收藏
   * @static
   * @param {WordIndex} target - 目标单词的索引
   * @returns {boolean} 如果已收藏返回true，否则返回false
   * @example const isFavorite = FavoriteUtil.is(favoriteList, [0, 1]);
   */
  static is(target: WordIndex): boolean {
    const app = getApp(); // 获取小程序实例
    // 从全局数据初始化收藏数据
    const favorite: FavoriteData[] = app.globalData.memorize.favorite;

    // 将数组转换为Map以便快速查找
    const favoriteMap: Map<string, FavoriteMetadata> = new Map(favorite);
    // 将单词索引编码为字符串作为Map的key
    return favoriteMap.has(WordIndexUtil.encode(target));
  }

  /**
   * 添加单词到收藏夹
   * @static
   * @param {WordIndex} target - 要收藏的单词索引
   * @returns {FavoriteData[]} 更新后的收藏列表
   * @description 添加时会记录收藏日期和列表索引
   */
  static add(target: WordIndex): FavoriteData[] {
    const app = getApp(); // 获取小程序实例
    // 从全局数据初始化收藏数据
    const favorite: FavoriteData[] = app.globalData.memorize.favorite;

    const favoriteMap: Map<string, FavoriteMetadata> = new Map(favorite);
    // 设置收藏项：key为编码后的索引，value为[收藏日期, 列表索引]
    favoriteMap.set(WordIndexUtil.encode(target), [
      new Date().toLocaleDateString(), // 收藏日期
      target[0], // 单词列表索引
    ]);

    // 将Map转换回数组格式返回
    app.globalData.memorize.favorite = Array.from(favoriteMap);
    return app.globalData.memorize.favorite;
  }

  /**
   * 从收藏夹移除单词
   * @static
   * @param {WordIndex} target - 要移除的单词索引
   * @returns {FavoriteData[]} 更新后的收藏列表
   */
  static delete(target: WordIndex): FavoriteData[] {
    const app = getApp(); // 获取小程序实例
    // 从全局数据初始化收藏数据
    const favorite: FavoriteData[] = app.globalData.memorize.favorite;

    const favoriteMap: Map<string, FavoriteMetadata> = new Map(favorite);
    // 从Map中删除指定单词
    favoriteMap.delete(WordIndexUtil.encode(target));
    app.globalData.memorize.favorite = Array.from(favoriteMap);
    return app.globalData.memorize.favorite;
  }

  /**
   * 将收藏数据转换为单词卡片格式
   * @static
   * @param {FavoriteData[]} favorite - 收藏列表数据
   * @returns {WordCard[]} 单词卡片数组
   * @description 用于在卡片页面展示收藏的单词
   */
  static toWordCards(favorite?: FavoriteData[]): WordCard[] {
    if (!favorite) {
      const app = getApp(); // 获取小程序实例
      // 从全局数据初始化收藏数据
      favorite = app.globalData.memorize.favorite;
    }

    const wordCards: WordCard[] = [];
    favorite!.map((x) => {
      // 解码得到单词索引
      const index: WordIndex = WordIndexUtil.decode(x[0]);
      // 从单词列表中获取单词数据，创建单词卡片
      return wordCards.push([index, wordList[index[0]][index[1]]]);
    });

    return wordCards;
  }
}

/**
 * 单词索引工具类 - 处理单词索引的编码解码
 * @class WordIndexUtil
 * @description 用于将单词索引[number, number]与字符串格式互相转换
 */
export class WordIndexUtil {
  /**
   * 将单词索引编码为字符串
   * @static
   * @param {WordIndex} value - 单词索引，格式为[列表索引, 单词索引]
   * @returns {string} 编码后的字符串，格式"列表索引,单词索引"
   * @example
   * const encoded = WordIndexUtil.encode([0, 5]); // 返回"0,5"
   */
  static encode(value: WordIndex): string {
    return `${value[0]},${value[1]}`;
  }

  /**
   * 将字符串解码为单词索引
   * @static
   * @param {string} value - 编码后的字符串，格式"列表索引,单词索引"
   * @returns {WordIndex} 解码后的单词索引
   * @example
   * const index = WordIndexUtil.decode("0,5"); // 返回[0, 5]
   */
  static decode(value: string): WordIndex {
    const temp: number[] = value
      .split(",")
      .map((x: string) => Number.parseInt(x));
    return [temp[0], temp[1]];
  }
}

/**
 * 用户卡片工具类 - 管理用户自定义卡片组
 * @class UserCardUtil
 * @description 提供用户卡片组的添加和删除功能
 */
export class UserCardUtil {
  /**
   * 添加用户卡片组
   * @static
   * @param {UserCardGroup} group - 要添加的卡片组，格式为[标题, 日期, 单词卡片数组]
   * @returns {UserCardGroup[]} 更新后的用户卡片组数组（返回数组长度，实际应为更新后的数组）
   * @description 将新的卡片组添加到用户卡片组数组末尾
   */
  static add(group: UserCardGroup): UserCardGroup[] {
    const app = getApp();
    app.globalData.memorize.userCardGroups.push(group);
    return app.globalData.memorize.userCardGroups;
  }

  /**
   * 删除用户卡片组
   * @static
   * @param {number} index - 要删除的卡片组索引
   * @returns {UserCardGroup[]} 删除指定卡片组后的新数组
   * @description 通过过滤保留不是目标索引的卡片组
   */
  static delete(index: number): UserCardGroup[] {
    // 过滤掉要删除的卡片组
    const app = getApp();
    app.globalData.memorize.userCardGroups =
      app.globalData.memorize.userCardGroups.filter(
        (_: UserCardGroup, i: number) => i !== index, // 保留不是目标索引的卡片组
      );
    return app.globalData.memorize.userCardGroups;
  }
}

/**
 * 跳转到单词卡片页面
 * @function navigateToWordCards
 * @param {string} cardsTitle - 卡片页面的标题
 * @param {WordCard[]} cards - 要展示的单词卡片数组
 * @param {number} [index=0] - 初始显示的卡片索引，默认为0
 * @param {number} [mode=0] - 展示模式，默认为0
 * @description 通过临时存储数据并跳转到卡片页面来实现页面间数据传递
 */
export function navigateToWordCards(
  cardsTitle: string,
  cards: WordCard[],
  index: number = 0,
  mode: number = 0,
) {
  const app = getApp();
  // 将卡片数据存储到临时变量中
  app.tempData.wordCards = {
    cardsTitle: cardsTitle,
    cards: cards,
    index: index,
    mode: mode,
  };

  // 跳转到单词卡片页面
  wx.navigateTo({ url: "/pages/word_cards/word_cards" });
}

/**
 * 跳转到单词游戏页面
 * @function navigateToWordGame
 * @param {WordCard[]} cards - 游戏使用的单词卡片数组
 * @description 初始化游戏数据并跳转到游戏页面
 */
export function navigateToWordGame(cards: WordCard[]) {
  const app = getApp();
  app.tempData.wordGame = {
    cards: cards,
  };

  wx.navigateTo({ url: "/pages/word_game/word_game" });
}

/**
 * 获取指定范围的单词卡片
 * @function getWordCards
 * @param {number} listIndex - 单词列表的索引
 * @param {number} [from] - 起始索引（包含），默认0
 * @param {number} [to] - 结束索引（不包含），默认列表长度
 * @returns {WordCard[]} 单词卡片数组
 * @description 从指定单词列表中截取指定范围的单词并转换为卡片格式
 * @example
 * const cards = getWordCards(0, 0, 10); // 获取第一个列表的前10个单词
 */
export function getWordCards(
  listIndex: number,
  from?: number,
  to?: number,
): WordCard[] {
  from = from ? from : 0;
  to = to ? to : wordList[listIndex].length;

  const cards: WordCard[] = [];
  // 遍历指定范围，为每个单词创建卡片
  for (let index = from; index < to; index++) {
    const element = wordList[listIndex][index];
    cards.push([[listIndex, index], element]);
  }

  return cards;
}

/**
 * 检查今日是否已打卡
 * @function isClockIn
 * @returns {boolean} 如果今日已打卡返回true，否则返回false
 * @description 通过检查历史记录中最新日期的打卡记录判断
 */
export function isClockIn() {
  const app = getApp();
  const history: HistoryData[] = app.globalData.memorize.history;

  if (history.length === 0) {
    return false;
  }

  const today = new Date().toLocaleDateString();
  // 按日期降序排序，获取最新记录
  history.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  return history[0][0] === today;
}

/**
 * 更新学习进度
 * @function updateProgress
 * @param {WordIndex} index - 当前学习到的单词索引
 * @param {boolean} [addToHistory=true] - 是否添加到历史记录，默认为true
 * @description 更新学习进度并可能创建新的打卡记录
 */
export function updateProgress(index: WordIndex, addToHistory: boolean = true) {
  const app = getApp();
  const history: HistoryData[] = app.globalData.memorize.history;
  const progress: number[] = app.globalData.memorize.progress;

  if (addToHistory) {
    // 如果今日未打卡，则创建新的打卡记录
    if (!isClockIn()) {
      const historyIndexRange: [number, number][] = progress.map(
        (x: number) => [x, x],
      );
      const historyData: HistoryData = [
        new Date().toLocaleDateString(),
        historyIndexRange,
      ];
      history.push(historyData);
      // 按日期降序排序
      history.sort(
        (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
      );
    }

    // 更新最新打卡记录中的进度
    history[0][1][index[0]][1] = index[1];
  }

  // 更新进度数组
  progress[index[0]] = index[1];

  app.globalData.memorize.history = history;
  app.globalData.memorize.progress = progress;
}

export function playAudio(text: string) {
  const audioContext = wx.createInnerAudioContext();
  audioContext.autoplay = false;
  const wordAudioApiUrl: string =
    "https://dict.youdao.com/dictvoice?type=0&audio=${word}";

  audioContext.stop();
  audioContext.src = wordAudioApiUrl.replace("${word}", text);
  audioContext.play();
}

/**
 * 默认全局数据模板
 * @constant defaultGlobalData
 * @type {string}
 * @description 全局数据的JSON字符串模板，用于初始化或重置应用数据
 * 包含用户信息、记忆数据、学习计划等结构
 */
export const defaultGlobalData: string = JSON.stringify({
  user: {
    loginCode: "",
    avatarUrl: "",
    nickName: "",
    llmUrl: "",
    llmKey: "",
    llmModel: "",
  },
  memorize: {
    history: new Array<HistoryData>(), // 学习历史记录
    progress: Array.from({ length: wordList.length }, () => 0), // 各列表学习进度
    favorite: new Array<FavoriteData>(), // 收藏的单词
    userCardGroups: new Array<[string, string, WordCard[]]>(), // 用户自定义卡片组
  },
  schedule: {
    listIndex: 0, // 当前学习的列表索引
    groupSize: 10, // 每组学习的单词数量
  },
  mistake: {
    list: new Array<MistakeData>(),
  },
});
