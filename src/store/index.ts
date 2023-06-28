import { InjectionKey } from "vue"
import { createStore } from "vuex";
import persistedState from 'vuex-persistedstate'
import Room from "../entity/Room";
import Setting from "../entity/Setting";
import User from "../entity/User";

export interface State {
  user: User,
  room: Room,
  setting: Setting
}

export const key: InjectionKey<State> = Symbol();

export const store = createStore<State>({
  state: {
    // 账号
    user: {
      name: null,
      id: null
    },
    room: {
      roomName: null,
      roomId: null,
      roomOwnerId: null
    },
    setting: {
      autoChangeUser: true,
      autoPlayAudio: true,
      autoEndGemRound: false,
    }
  },
  getters: {
    /**
     * 获取已设置的账号 
     * @returns 若没有设置账号，则返回false否则返回账号
     */
    getUser({ user }: State): false | User {
      if (user.id == null || user.name == null || user.name.length == 0 || user.id.length == 0)
        return false;
      else
        return user
    },
    /**
     * 获取已加入房间
     * @returns 若没有加入房间，则返回false否则返回房间
     */
    getRoom({ room }: State): false | Room {
      if (room.roomId == null || room.roomName == null || room.roomName.length == 0 || room.roomId.length == 0)
        return false;
      else
        return room;
    },
    /**
     * 获取设置
     * @returns
     */
    getSetting({ setting }: State): Setting {
      return setting;
    },

  },
  mutations: {
    /**
     * 设置User信息
     * @param _user 更新的User对象
     * @returns 无
     */
    setUser(state: State, _user: User): void {
      state.user = _user
    },
    /**
     * 设置Room信息
     * @param _room 更新的Room对象
     * @returns 无
     */
    setRoom(state: State, _room: Room): void {
      state.room = _room
    },
    /**
     * 设置Setting信息
     * @param _setting 更新的Setting对象
     * @returns 无
     */
     setSetting(state: State, _setting: Setting): void {
      state.setting = _setting
    },
  },
  plugins: [
    persistedState({
      storage: window.localStorage
    })
  ] //添加插件
})