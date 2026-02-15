# Platform Compatibility Guide

## Current Technology Stack

**Read The Room** is built with the following technologies that are fully compatible with ARM64 macOS (Apple Silicon):

- **Next.js 16** ✅ Native ARM64 support
- **React 19** ✅ Native ARM64 support
- **TypeScript** ✅ Native ARM64 support
- **Tailwind CSS v4** ✅ Native ARM64 support
- **Google Generative AI (Gemini)** ✅ Cloud-based, platform-agnostic

## System Requirements

### Minimum Requirements
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher (or equivalent package manager)
- **Operating Systems**:
  - macOS 11.0+ (including Apple Silicon M1/M2/M3)
  - Windows 10/11 (x86-64 and ARM64)
  - Linux (x86-64 and ARM64)

### Recommended Requirements
- **Node.js**: 20.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for dependencies

## ARM64 macOS (Apple Silicon) Compatibility

All current dependencies are **fully compatible** with ARM64 macOS:

| Package | ARM64 Support | Notes |
|---------|---------------|-------|
| Next.js 16 | ✅ Native | Full native support |
| React 19 | ✅ Native | Full native support |
| TypeScript 5 | ✅ Native | Full native support |
| Tailwind CSS 4 | ✅ Native | Full native support |
| @google/generative-ai | ✅ Native | Cloud-based API |
| Framer Motion | ✅ Native | Full native support |
| Recharts | ✅ Native | Full native support |

### Installation on Apple Silicon

No special configuration is required for Apple Silicon Macs:

```bash
# Standard installation works natively
npm install
npm run dev
```

The application runs natively on ARM64 without requiring Rosetta 2 translation.

## CTranslate2 Compatibility (Future Considerations)

### Overview

**CTranslate2** is a fast inference engine for Transformer models. While not currently used in this project, here's compatibility information for future reference:

### ARM64 macOS Support

CTranslate2 **supports ARM64 macOS** (Apple Silicon) with native binaries:

#### Version Support
- **v4.7.0+**: Native ARM64 wheels available via PyPI
- **Earlier versions**: May require compilation from source

#### Installation (if added in future)

**Native ARM64:**
```bash
pip install ctranslate2
```

**Requirements:**
- Python 3.9+
- pip (latest version recommended)

**Build from Source (optional):**
```bash
git clone --recursive https://github.com/OpenNMT/CTranslate2.git
cd CTranslate2
pip install -r install_requirements.txt
python setup.py bdist_wheel
pip install dist/*.whl
```

#### Performance Notes
- Native ARM64 binaries use **Apple Accelerate** framework for optimized matrix operations
- Performance is optimal when running natively (not under Rosetta 2)
- ARM64 builds can leverage Apple Silicon's unified memory architecture

#### Compatibility Table

| CTranslate2 Version | ARM64 Wheels | Installation Method | Performance |
|---------------------|--------------|---------------------|-------------|
| v4.7.1+ | ✅ Available | `pip install` | Native, Optimal |
| v4.4.0 - v4.7.0 | ⚠️ Limited | May need source build | Native, Optimal |
| < v4.4.0 | ❌ Not available | Source build required | Native, Optimal |

### Known Issues & Solutions

**Issue**: Older CTranslate2 versions may not have prebuilt ARM64 wheels  
**Solution**: Compile from source or upgrade to v4.7.1+

**Issue**: Rosetta 2 performance degradation  
**Solution**: Ensure native ARM64 wheels are installed (check with `pip show ctranslate2`)

### Verification

To verify native ARM64 installation (if CTranslate2 is added):

```bash
python -c "import ctranslate2; print(ctranslate2.__version__)"
lipo -info $(python -c "import ctranslate2; print(ctranslate2.__file__)")
```

Expected output should show `arm64` architecture.

## Browser Compatibility

The web application supports all modern browsers:

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Android 90+

## Development Environment

### Recommended Setup
- **IDE**: Visual Studio Code with ESLint and TypeScript extensions
- **Terminal**: Any POSIX-compliant shell
- **Git**: 2.20+

## Troubleshooting

### Apple Silicon Specific Issues

**Problem**: Dependencies fail to install  
**Solution**: 
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Performance issues  
**Solution**: Verify Node.js is running natively:
```bash
node -p "process.arch"
# Should output: arm64
```

## Contributing

When contributing, ensure your changes maintain cross-platform compatibility:
- Test on both x86-64 and ARM64 if possible
- Avoid platform-specific dependencies
- Document any architecture-specific requirements

## References

- [Next.js Platform Support](https://nextjs.org/docs)
- [Node.js Binary Distributions](https://nodejs.org/en/download/)
- [CTranslate2 Documentation](https://opennmt.net/CTranslate2/)
- [Apple Silicon Developer Resources](https://developer.apple.com/documentation/apple-silicon)

---

*Last Updated: February 2026*
