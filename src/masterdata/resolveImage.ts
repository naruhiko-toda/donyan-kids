import { imageAssets } from "./imageAssets";

// 画像IDからローカルアセット(require番号)を返す
// 未登録の場合は undefined（呼び出し側でフォールバックする）
export const resolveImageById = (id: string): number | undefined => {
  return imageAssets[id];
};
