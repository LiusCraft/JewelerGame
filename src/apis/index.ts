import axios, { AxiosResponse } from 'axios';
import { createDiscreteApi } from 'naive-ui';
const instance = axios.create({
  baseURL: 'http://gem.xhystudy.cn/api',
  // baseURL: "http://192.168.131.81:9000",
  timeout: 1000000,
  headers: {},
});

const naiveApi = createDiscreteApi(["message"])
// 添加请求拦截器
instance.interceptors.request.use(config => {
  return config;
}, error => {
  return Promise.reject(error)
})

// 添加响应拦截器
instance.interceptors.response.use((response:AxiosResponse) => {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response;
}, (error: Error) => {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  naiveApi.message.error(error.message)
  return ;
});

export default instance;