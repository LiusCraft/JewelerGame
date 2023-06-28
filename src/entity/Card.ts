export interface CardInfo{ 
  /**
     * 该玩意是map,玩家使用的buff。key:宝石类型,value:宝石数量
     */
   gemCards?: Map<number,number>;
   /**
    * 换取卡牌的宝石信息，该玩意是map. key:需要的宝石类型, value:需要的宝石数量。都是Integer类型
    */
   card?: string;
   /**
    * 卡牌拥有的buff
    */
   cardBuff: number;
   /**
    * 卡牌得分
    */
   score: number;
   /**
    * 卡牌类型: 几级卡
    */
   type: number;
   /**
    * 需要宝石
    */
   gems?: Map<number, number>,
   replaceGems?: Map<number, number>,
   /**
    * 编号
    */
   no: number
}

export interface ICard {
  score: number,
  type: number,
  gems: Map<number, number>,
  cardBuff: number,
  no: number
}