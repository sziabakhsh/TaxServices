public interface ISensitiveDataProtector
{
    string Protect(string plainText);

    string Unprotect(string protectedText);

    string ComputeHash(string plainText);
}
