/**
 * 宝石
 */
export interface IGem {
  type: number;
  name: string;
  count: number;
  color: string;
}
/**
 * 宝石基本类型
 */
export const GemType = {
  BLUE: {
    type: 1,
    name: "蓝宝石",
    count: 0,
    color: "blue"
  } as IGem,
  RED: {
    type: 2,
    name: "红宝石",
    count: 0,
    color: "red"
  } as IGem,
  BLACK: {
    type: 3,
    name: "黑宝石",
    count: 0,
    color: "black"
  } as IGem,
  GREEN: {
    type: 4,
    name: "绿宝石",
    count: 0,
    color: "green"
  } as IGem,
  WHITE: {
    type: 5,
    name: "白宝石",
    count: 0,
    color: "grey"
  } as IGem,
  GOLD: {
    type: 6,
    name: "金宝石",
    count: 0,
    color: "rgb(160, 160, 0)"
  } as IGem,
}

export const GemMap:Map<number,IGem> = new Map([
  [1,GemType.BLUE],
  [2,GemType.RED],
  [3,GemType.BLACK],
  [4,GemType.GREEN],
  [5,GemType.WHITE],
  [6,GemType.GOLD]
])

