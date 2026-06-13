// Transform model gateway. Re-export utilitas dari @claudprox/shared agar
// tidak ada duplikasi tabel MODEL_MAP. Gateway memakai fungsi ini untuk
// mengubah model versi user (tanpa kr/) menjadi model upstream (dengan kr/).

export {
  toUpstreamModel,
  toUserModel,
  listUserModels,
  MODEL_MAP,
  REVERSE_MODEL_MAP,
} from "@claudprox/shared";
