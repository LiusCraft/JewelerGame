import index from './index';
let rootUrl: string = "/room";
/**
 * 获取房间列表
 */
export function API_GET_ROOM_PAGE() {
  return index.get(`${rootUrl}/page`);
}

/**
 * 创建房间
 * /room/create
 * @param roomName 房间名
 * @param roomOwnerId 房主UUID
 */
export function API_POST_ROOM_CREATE(roomName: string, roomOwnerId: string) {
  return index.post(`${rootUrl}/create`,{
    roomName: roomName,
    roomOwnerId: roomOwnerId
  })
}

/**
 * 搜索房间ID
 * @param roomId 房间ID
 */
export function API_GET_ROOM_SEARCH(roomId:string) {
  return index.get(`${rootUrl}/search?roomId=${roomId}`);
}

/**
 * 加入到房间
 * @param roomId 房间ID
 * @param userId 用户ID
 */
export function API_POST_ROOM_JOIN(roomId:string,userId:string) {
  return index.post(`${rootUrl}/join?roomId=${roomId}&userId=${userId}`);
}

/**
 * 获取当前房间的所有用户
 * @param roomId 房间ID
 */
export function API_GET_ROOM_INUSERS(roomId:string) {
  return index.get(`${rootUrl}/getRoomInUsers?roomId=${roomId}`);
}

/**
 * 获取主页信息
 */
export function API_GET_ROOM_INFOS() {
  return index.get(`/roomsInfo`);
}