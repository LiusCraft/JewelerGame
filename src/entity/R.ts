/**
 * 响应体
 */
export default interface R {
  /**
   * 状态码
   */
  code: number,
  /**
   * 数量
   */
  count: number,
  /**
   * 数据
   */
  data: any,
  /**
   * 消息
   */
  message: string,
  /**
   * 状态
   */
  state: boolean,
  /**
   * 当前处理类型
   */
  type: number,
}