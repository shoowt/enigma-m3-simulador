import type { ModernEncryptedBundle } from '../types/crypto';

export class ModernCryptoEngine {
  private static getCrypto(): Crypto {
    if (typeof window !== 'undefined' && window.crypto) {
      return window.crypto;
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      return globalThis.crypto;
    }
    throw new Error('Web Crypto API não disponível neste ambiente.');
  }

  private static async deriveKey(secretPassphrase: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const cryptoApi = this.getCrypto();

    const keyMaterial = await cryptoApi.subtle.importKey(
      'raw',
      enc.encode(secretPassphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return cryptoApi.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('ENIGMA_VS_MODERN_SALT_BLETCHLEY_1944'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  public static async encrypt(plainText: string, secretKey: string): Promise<ModernEncryptedBundle> {
    const key = await this.deriveKey(secretKey);
    const cryptoApi = this.getCrypto();
    const iv = cryptoApi.getRandomValues(new Uint8Array(12)); // 96-bit IV recomendado para GCM
    const encodedData = new TextEncoder().encode(plainText);

    // SubtleCrypto concatena a tag de autenticação de 16 bytes no final do buffer
    const encryptedBuffer = await cryptoApi.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      encodedData
    );

    const fullCipherBytes = new Uint8Array(encryptedBuffer);
    const tagLength = 16;
    const ctBytes = fullCipherBytes.slice(0, fullCipherBytes.length - tagLength);
    const tagBytes = fullCipherBytes.slice(fullCipherBytes.length - tagLength);

    return {
      ciphertextBase64: btoa(String.fromCharCode(...ctBytes)),
      ivBase64: btoa(String.fromCharCode(...iv)),
      tagBase64: btoa(String.fromCharCode(...tagBytes)),
      tampered: false
    };
  }

  public static async decrypt(
    bundle: ModernEncryptedBundle,
    secretKey: string
  ): Promise<{ success: boolean; decryptedText?: string; error?: string }> {
    try {
      const key = await this.deriveKey(secretKey);
      const cryptoApi = this.getCrypto();
      const iv = new Uint8Array(atob(bundle.ivBase64).split('').map(c => c.charCodeAt(0)));
      const ct = new Uint8Array(atob(bundle.ciphertextBase64).split('').map(c => c.charCodeAt(0)));
      const tag = new Uint8Array(atob(bundle.tagBase64).split('').map(c => c.charCodeAt(0)));

      // Recompõe o buffer com [Ciphertext + Tag]
      const fullBuffer = new Uint8Array(ct.length + tag.length);
      fullBuffer.set(ct, 0);
      fullBuffer.set(tag, ct.length);

      const decrypted = await cryptoApi.subtle.decrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        key,
        fullBuffer
      );

      return {
        success: true,
        decryptedText: new TextDecoder().decode(decrypted)
      };
    } catch {
      return {
        success: false,
        error: 'CRITICAL INTEGRITY FAILURE: Authentication Tag Mismatch! O pacote foi interceptado ou adulterado (MITM).'
      };
    }
  }

  /**
   * Simula um ataque Man-in-the-Middle (MITM) invertendo 1 bit no ciphertext
   */
  public static tamperBundle(bundle: ModernEncryptedBundle): ModernEncryptedBundle {
    const rawCt = atob(bundle.ciphertextBase64);
    if (rawCt.length === 0) return { ...bundle, tampered: true };

    const bytes = rawCt.split('').map(c => c.charCodeAt(0));
    // Inverte 1 bit no primeiro byte
    bytes[0] ^= 0x01;

    return {
      ...bundle,
      ciphertextBase64: btoa(String.fromCharCode(...bytes)),
      tampered: true
    };
  }
}
