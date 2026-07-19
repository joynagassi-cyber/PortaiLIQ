export async function uploadToR2(
  file: File,
  key: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("R2 upload error:", error);
    throw error;
  }
}
