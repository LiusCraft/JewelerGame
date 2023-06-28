import { Content } from "./Content";

export interface ClientRequestContent {
  /**
   * 消息内容
   */
   content?: Content | null;
   /**
    * 房间名
    */
   roomId?: string;
   /**
    * 用户id
    */
   sendId?: string;
   /**
    * 消息类型
    */
   type: number;
   /**
    * 机器人等级 0，1
    */
   robotLevel?: number;
}