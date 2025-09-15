using System.Security.Cryptography;
using System.Text;

namespace Fuguo.WorkOrderSystem.Api.Services
{
    public interface IPasswordEncryptionService
    {
        string Encrypt(string plainPassword);
        string Decrypt(string encryptedPassword);
        bool Verify(string plainPassword, string encryptedPassword);
    }

    public class AesPasswordEncryptionService : IPasswordEncryptionService
    {
        private readonly string _encryptionKey;

        public AesPasswordEncryptionService(IConfiguration configuration)
        {
            // 使用 JWT 設定中的 Key 作為加密金鑰
            _encryptionKey = configuration["JwtSettings:Key"] ?? throw new InvalidOperationException("加密金鑰未設定");
        }

        public string Encrypt(string plainPassword)
        {
            if (string.IsNullOrEmpty(plainPassword))
                return string.Empty;

            try
            {
                using var aes = Aes.Create();
                aes.Key = DeriveKeyFromString(_encryptionKey, 32); // AES-256 需要 32 位元組金鑰
                aes.GenerateIV(); // 產生隨機 IV

                using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
                using var ms = new MemoryStream();
                
                // 先寫入 IV
                ms.Write(aes.IV, 0, aes.IV.Length);
                
                using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                using (var sw = new StreamWriter(cs))
                {
                    sw.Write(plainPassword);
                }

                return Convert.ToBase64String(ms.ToArray());
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("密碼加密失敗", ex);
            }
        }

        public string Decrypt(string encryptedPassword)
        {
            if (string.IsNullOrEmpty(encryptedPassword))
                return string.Empty;

            try
            {
                var fullCipher = Convert.FromBase64String(encryptedPassword);

                using var aes = Aes.Create();
                aes.Key = DeriveKeyFromString(_encryptionKey, 32);

                // 提取 IV (前 16 位元組)
                var iv = new byte[16];
                Array.Copy(fullCipher, 0, iv, 0, 16);
                aes.IV = iv;

                // 提取加密的資料
                var cipher = new byte[fullCipher.Length - 16];
                Array.Copy(fullCipher, 16, cipher, 0, cipher.Length);

                using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
                using var ms = new MemoryStream(cipher);
                using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
                using var sr = new StreamReader(cs);

                return sr.ReadToEnd();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("密碼解密失敗", ex);
            }
        }

        public bool Verify(string plainPassword, string encryptedPassword)
        {
            try
            {
                var decryptedPassword = Decrypt(encryptedPassword);
                return plainPassword == decryptedPassword;
            }
            catch
            {
                return false;
            }
        }

        private static byte[] DeriveKeyFromString(string keyString, int keySize)
        {
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(keyString));
            var key = new byte[keySize];
            Array.Copy(hash, key, Math.Min(hash.Length, keySize));
            return key;
        }
    }
}