const ALLOWED_AVATAR_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function toPrismaBytes(buffer: ArrayBuffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
}

export function isAllowedAvatarMimeType(mime: string) {
  return ALLOWED_AVATAR_MIME_TYPES.includes(mime);
}

export async function fileToStoredAvatar(file: File) {
  if (file.size <= 0) {
    throw new Error("Empty avatar file");
  }
  if (!isAllowedAvatarMimeType(file.type)) {
    throw new Error("Unsupported avatar type");
  }

  const buffer = await file.arrayBuffer();

  return {
    avatarData: toPrismaBytes(buffer),
    avatarMime: file.type,
  };
}

export async function urlToStoredAvatar(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to download avatar");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!isAllowedAvatarMimeType(contentType)) {
    throw new Error("Unsupported avatar type");
  }

  const buffer = await response.arrayBuffer();

  return {
    avatarData: toPrismaBytes(buffer),
    avatarMime: contentType,
  };
}
