import { CardInfo } from "./Card";
import INobility from "./Nobility";


/**
 * 消息内容
 */
export interface Content {
  /**
     * 当前用户回合换取卡牌信息
     */
   cardInfo?: CardInfo;
   /**
    * 宝石类型，当前用户回合拿取宝石信息  ,
    */
   gem?: number;
   /**
    * 当期用户id
    */
   id: string;
   /**
    * 消息类型
    */
   message?: string;
   /**
    * 贵族信息
    */
   nobility?: INobility;
}