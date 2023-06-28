/**
 * 贵族类型
 */
export default interface INobility {
  /**
     * 需要的换取卡牌信息，该玩意是map，key为：卡牌类型，value：对应的卡牌数量
     */
   cards?: Map<number,number>
   /**
    * 分数
    */
   score?: number,
   no: number,
}