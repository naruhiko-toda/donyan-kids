import { imageAssets } from "./imageAssets";

// 引数 path が URL の場合はそのまま返し、ローカルキーの場合は imageAssets から解決
export const resolveImagePath = (path: string): string | number => {
  const isRemote = /^https?:\/\//.test(path);
  if (isRemote) return path;
  const asset = imageAssets[path];
  return asset ?? path; // 未登録なら文字列のまま返す（開発時の検出用）
};
