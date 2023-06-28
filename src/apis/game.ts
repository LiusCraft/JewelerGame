import index from './index';
let rootUrl: string = "/game";

/**
 * 启动当前房间的游戏
 * @param roomId 房间ID
 */
export function API_POST_GAME_START(roomId: string) {
  return index.post(`${rootUrl}/start?roomId=${roomId}`);
}


/**
 * 获取当前房间信息
 * @param roomId 房间ID
 */
export function API_GET_GAME_INFO(roomId: string) {
  return index.get(`${rootUrl}/get?roomId=${roomId}`);
}