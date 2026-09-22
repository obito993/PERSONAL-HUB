import { put, del } from '@vercel/blob';

/**
 * Server-side Vercel Blob Storage Service for Private PDF Study Materials.
 * All operations enforce access: 'private' and use BLOB_READ_WRITE_TOKEN.
 */
export class BlobStudyService {
  private static getBlobToken(): string {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.warn('[BLOB SERVICE WARNING] BLOB_READ_WRITE_TOKEN is missing in environment.');
    }
    return token || '';
  }

  /**
   * Uploads an original study PDF to Private Vercel Blob store.
   * Path: users/{userId}/study/{documentId}/original/{safeFilename}
   */
  static async uploadPrivatePDF(
    userId: string,
    documentId: string,
    fileName: string,
    bufferInput: Buffer | Uint8Array
  ): Promise<{ pathname: string; url: string }> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `users/${userId}/study/${documentId}/original/${safeName}`;

    const token = this.getBlobToken();
    const buffer = Buffer.isBuffer(bufferInput) ? bufferInput : Buffer.from(bufferInput);

    // Store as private access
    const blob = await put(pathname, buffer, {
      access: 'private',
      contentType: 'application/pdf',
      token: token || undefined,
    });

    return {
      pathname: blob.pathname,
      url: blob.url,
    };
  }

  /**
   * Deletes a private PDF Blob object from Vercel Blob store.
   */
  static async deletePrivatePDF(blobUrlOrPathname: string): Promise<void> {
    if (!blobUrlOrPathname) return;
    try {
      const token = this.getBlobToken();
      await del(blobUrlOrPathname, {
        token: token || undefined,
      });
    } catch (err) {
      console.error('[BLOB DELETE ERROR]', err);
    }
  }

  /**
   * Server-side retrieval of private Blob buffer for text extraction & chunking.
   */
  static async getPrivatePDFBuffer(blobUrl: string): Promise<Buffer> {
    const token = this.getBlobToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(blobUrl, { headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch private Blob file: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
