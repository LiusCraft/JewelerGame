import index from './index';
let rootUrl: string = "/log";

/**
 * 获取当前房间的游戏日志
 * @param roomId 房间ID
 */
export function API_GET_LOG_ROOM(roomId:string){
  return index.get(`${rootUrl}/get?roomId=${roomId}`)
}