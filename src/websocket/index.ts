import { ClientRequestContent } from "../entity/ClientRequestContent";
import R from '../entity/R';
var WS_CLIENT: WebSocket;
const WS_SERVER = {
  url: "",
}
var debug: boolean = false;
/**
* pop的返回值当data为空时返回undefined
* 使用了泛型约束
*/
const data: Map<number, Function[]> = new Map();

function WS_init(url: string,
  onOpenCallBack: ((this: WebSocket, ev: Event) => any) | null,
  onCloseCallBack: ((ev: CloseEvent) => any) | null,
  onMessageCallBack: ((this: WebSocket, ev: MessageEvent<any>) => any) | null) {
  if (debug)
    console.log("WS-尝试连接到服务器", url)
  WS_CLIENT = new WebSocket(url);
  WS_SERVER.url = url;
  onOpen(onOpenCallBack);
  onClose(onCloseCallBack);
  onMessage(onMessageCallBack);
}
/**
 * 重新连接
 */
function WS_retryConnect() {
  if(debug)
    console.log("WS-尝试重新连接到服务器", WS_SERVER.url)
  WS_CLIENT = new WebSocket(WS_SERVER.url);
}
/**
 * 发送内容到服务端
 * @param str 内容
 * @param runSleepTime 重试时间
 * @param runCountEnd 重试次数
 */
function SendMessage(str: string, runSleepTime?: number, runCountEnd?: number) {
  let runCount = 0;
  let _runCountEnd: number = runCountEnd == undefined ? 3 : runCountEnd;
  let _runSleepTime = runSleepTime == undefined ? 90000 : runSleepTime;
  let runInterVal = setInterval(() => {

    if (runCount > _runCountEnd) {
      clearInterval(runInterVal);
      if (debug)
        console.log("WS-发送消息失败: ", str);
      WS_retryConnect();
      return;
    }
    if (debug)
      console.log("WS-尝试发送消息[" + runCount + "]: ", str);
    runCount++;
    if (WS_CLIENT.readyState != 1)
      return;
    WS_CLIENT.send(str);
    if (debug)
      console.log("WS-发送消息成功: ", str);
    runCount = 0;
    clearInterval(runInterVal);
    return;
  }, 0, _runSleepTime)

}

/**
 * 设置连接成功回调函数
 * @param callback 连接到服务端后回调此函数
 */
function onOpen(callback: ((this: WebSocket, ev: Event) => any) | null) {
  if (debug)
    console.log("WS-设置连接回调")
  WS_CLIENT.onopen = () => {
  }

}
/**
 * 设置关闭连接回调函数   
 * @param callback 关闭连接后回调此函数
 */
function onClose(callback: ((ev: CloseEvent) => any) | null) {
  if (debug)
    console.log("WS-设置关闭回调")
  WS_CLIENT.onclose = (ev: CloseEvent)=>{
    if(callback != null)
      callback(ev);
    WS_retryConnect();
  };
}
function onMessage(callBack: ((this: WebSocket, ev: MessageEvent<any>) => any) | null) {
  if (debug)
    console.log("WS-设置消息回调")
  if (callBack == null)
    onMessage((ev: MessageEvent) => {
      let result = JSON.parse(ev.data) as R;
      runHandlerFun(result.type, result);

    });
  else
    WS_CLIENT.onmessage = callBack;
}

/**
 * 发送一个封装的请求体
 * @param request 请求体内容
 */
function SendClientRequestContent(
  request: ClientRequestContent,
  call?: Function
): void {
  if (call) {
    addHandlerFun(request.type, call);
  }
  SendMessage(JSON.stringify(request));

}

/**
 * 添加消息处理
 * @param type 处理标识符
 * @param call 处理函数
 */
function addHandlerFun(type: number, call: Function) {
  let handlerFun = data.get(type);
  if (handlerFun == undefined) {
    handlerFun = [];
  }
  handlerFun.unshift(call);
  data.set(type, handlerFun)
}

/**
 * 清除消息处理函数
 */
function clearHandlerFun() {
  data.clear();
}

/**
 * 运行某标识符下的所有处理函数
 * @param type 处理标识符
 * @param result 传入的响应体 R
 */
function runHandlerFun(type: number, result: R) {
  let handlerFuns = data.get(type);
  let defaultFuns = data.get(-1); // 全局处理函数
  let deleteFun: Function[] = [];
  if (debug)
    console.log("WS-收到的消息", type, result);
  if(type==15) {
    SendClientRequestContent({
      type: 15
    })
  }
  handlerFuns?.forEach(fun => {
    if (fun(result))
      deleteFun.push(fun);
  })
  defaultFuns?.forEach(fun => {
    if (fun(result))
      deleteFun.push(fun);
  })
  handlerFuns = [];
  data.get(type)?.forEach((fun1: Function) => {
    let index: number = -1;
    for (let index2 = 0; index2 < deleteFun.length; index2++) {
      const element = deleteFun[index2];
      if (element === fun1) {
        index = index2;
        break;
      }
    }
    if (index != -1) {
      deleteFun = deleteFun.splice(index, 1);
    } else {
      handlerFuns?.push(fun1);
    }
  });
  data.set(type, handlerFuns);
}

function WS_close() {
  typeof WS_CLIENT.close == 'function' && WS_CLIENT.close();
}

const WSUtils = {
  init: WS_init,
  sendMessage: SendMessage,
  onMessage: onMessage,
  onOpen: onOpen,
  onClose: onClose,
  sendClientRequestContent: SendClientRequestContent,
  debug: () => { debug = true },
  addHandlerFun: addHandlerFun,
  runHandlerFun: runHandlerFun,
  clearHandlerFun: clearHandlerFun,
  retryConnect: WS_retryConnect,
  close: WS_close,
};
export default WSUtils;
