import Mux from "@mux/mux-node"

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function createUploadUrl(): Promise<{ url: string; uploadId: string }> {
  const upload = await mux.video.uploads.create({
    cors_origin: "http://localhost:3000",
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
  })
  return { url: upload.url, uploadId: upload.id }
}

export async function getAssetId(uploadId: string): Promise<string | null> {
  const upload = await mux.video.uploads.retrieve(uploadId)
  return upload.asset_id ?? null
}

export async function getPlaybackId(assetId: string): Promise<string | null> {
  const asset = await mux.video.assets.retrieve(assetId)
  return asset.playback_ids?.[0]?.id ?? null
}
