import index from './index';
let rootUrl: string = "/user";

/**
 * 创建用户
 * @param userName 用户名
 * @returns 响应体
 */
 export function API_POST_USER_CREATE(userName: string) {
  return index.post(`${rootUrl}/create?name=${userName}`);
}

/**
 * 判断当前用户UUID是否存在
 * @param userId 用户UUID
 * @returns 存在True否则False
 */
export async function API_GET_USER_EXIST(userId:string) {
  return index.get(`${rootUrl}/exist?userId=${userId}`).then(res=>{
    return res.data.state;
  }).catch(()=>{
    return false;
  });
}