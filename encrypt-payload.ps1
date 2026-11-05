$ErrorActionPreference = "Stop"

$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$password = 'Hitss2026$SecuredPass'
$saltStr = 'HITSS_SECURE_SALT_2026_V1'
$salt = [System.Text.Encoding]::UTF8.GetBytes($saltStr)
$pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 200000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
$key = $pbkdf2.GetBytes(32)
$iv = [Convert]::FromBase64String('5rk37Llzj99IrvohN/ZPzw==')

$aes = [System.Security.Cryptography.Aes]::Create()
$aes.Key = $key
$aes.IV = $iv
$aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
$aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7

$payloadPath = Join-Path $dir "payload_clean.js"
$rawContent = [System.IO.File]::ReadAllText($payloadPath, [System.Text.Encoding]::UTF8)
$rawBytes = [System.Text.Encoding]::UTF8.GetBytes($rawContent)
$encryptor = $aes.CreateEncryptor()
$cipherBytes = $encryptor.TransformFinalBlock($rawBytes, 0, $rawBytes.Length)
$cipherB64 = [Convert]::ToBase64String($cipherBytes)

# Save to encrypted_payload.txt
$encTxtPath = Join-Path $dir "encrypted_payload.txt"
Set-Content -Path $encTxtPath -Value $cipherB64 -Encoding UTF8 -NoNewline

# Replace ENCRYPTED_PAYLOAD_BASE64 in app.src.js
$appSrcPath = Join-Path $dir "app.src.js"
$srcContent = [System.IO.File]::ReadAllText($appSrcPath, [System.Text.Encoding]::UTF8)
$pattern = 'const ENCRYPTED_PAYLOAD_BASE64 = "[^"]+";'
$replacement = 'const ENCRYPTED_PAYLOAD_BASE64 = "' + $cipherB64 + '";'
$newSrcContent = [regex]::Replace($srcContent, $pattern, $replacement)
[System.IO.File]::WriteAllText($appSrcPath, $newSrcContent, [System.Text.Encoding]::UTF8)

# Compile app.src.js -> app.js with secure base64 loader
$srcBytes = [System.Text.Encoding]::UTF8.GetBytes($newSrcContent)
$appBase64 = [Convert]::ToBase64String($srcBytes)
$appWrapped = "(function(_0x5a1b,_0x3f2c){var _0x1d4e=function(_0x4b2a){return decodeURIComponent(atob(_0x4b2a).split('').map(function(c){return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2);}).join(''));};var _0x9e8a=_0x1d4e(_0x3f2c);var _0x2c1f=document.createElement('script');_0x2c1f.text=_0x9e8a;document.head.appendChild(_0x2c1f);})(this,'$appBase64');"
$appJsPath = Join-Path $dir "app.js"
[System.IO.File]::WriteAllText($appJsPath, $appWrapped, [System.Text.Encoding]::UTF8)

Write-Host "✅ Payload encrypted and app.js generated successfully in $dir!"
