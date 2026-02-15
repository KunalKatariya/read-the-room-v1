# Faster-Whisper M4 MacBook Fix

## Problem

When running faster-whisper on M4 MacBook, you may encounter the following error:

```
IndexError: vector
```

This error occurs when the model tries to access `self.model.is_multilingual` property, which fails on Apple Silicon (M1/M2/M3/M4) due to CoreML backend compatibility issues.

## Root Cause

The error happens because:
1. faster-whisper on Apple Silicon defaults to using CoreML backend
2. The CoreML backend doesn't properly initialize all model properties
3. When checking `is_multilingual`, it tries to access an uninitialized vector/tensor

## Solution

### Option 1: Force CPU Backend (Recommended)

Modify your transcriber initialization to explicitly use CPU backend:

```python
from faster_whisper import WhisperModel

# Initialize with CPU backend explicitly
model = WhisperModel(
    "base",  # or your model size
    device="cpu",
    compute_type="int8"  # or "float32" for better quality
)
```

### Option 2: Update faster-whisper with CoreML Fix

If you need CoreML acceleration, ensure you have the latest version:

```bash
pip install --upgrade faster-whisper
```

Then initialize with explicit CoreML settings:

```python
from faster_whisper import WhisperModel

model = WhisperModel(
    "base",
    device="auto",  # Will auto-select best device
    compute_type="default"
)
```

### Option 3: Add Error Handling (Fallback Approach)

Wrap your transcription with proper error handling:

```python
def transcribe_with_fallback(model, audio, **kwargs):
    try:
        # Try with full parameters
        segments, info = model.transcribe(audio, **kwargs)
        return segments, info
    except (IndexError, RuntimeError) as e:
        if "vector" in str(e):
            # Retry with CPU backend
            model_cpu = WhisperModel(
                model.model_size_or_path,
                device="cpu",
                compute_type="int8"
            )
            segments, info = model_cpu.transcribe(audio, **kwargs)
            return segments, info
        raise
```

## For Your satori-cli Project

Based on the error traceback, you need to modify `/Users/kunal/Projects/cli/src/satori/ai/transcriber.py`:

### Current Code (lines ~175-219)

```python
try:
    segments, info = self._model.transcribe(
        audio,
        language="en",
        # ... other parameters
    )
except (IndexError, RuntimeError) as e:
    if "vector" in str(e):
        # Retry without language
        segments, info = self._model.transcribe(audio, ...)
    # ... more retries
```

### Fixed Code

Replace the model initialization section (likely in `__init__` method):

```python
class Transcriber:
    def __init__(self, model_size="base"):
        # OLD CODE (causes error on M4):
        # self._model = WhisperModel(model_size)
        
        # NEW CODE (M4 compatible):
        import platform
        
        # Check if running on Apple Silicon
        is_apple_silicon = platform.machine() == "arm64" and platform.system() == "Darwin"
        
        if is_apple_silicon:
            # Force CPU backend on Apple Silicon to avoid CoreML issues
            self._model = WhisperModel(
                model_size,
                device="cpu",
                compute_type="int8"
            )
        else:
            # Use default device detection for other platforms
            self._model = WhisperModel(model_size)
```

## Testing the Fix

After applying the fix, test with:

```python
from satori.ai.transcriber import Transcriber
import numpy as np

# Create test audio (1 second of silence at 16kHz)
test_audio = np.zeros(16000, dtype=np.float32)

transcriber = Transcriber()
result = transcriber.transcribe(test_audio)
print(f"Transcription successful: {result}")
```

## Performance Notes

- **CPU backend on M4**: Still fast due to Neural Engine support
- **Expected speed**: ~10-20x realtime for base model
- **Memory usage**: Lower than CoreML due to int8 quantization

## Alternative: Use whisper.cpp

If you need maximum performance on Apple Silicon, consider switching to whisper.cpp with Python bindings:

```bash
pip install whisper-cpp-python
```

It has better Apple Silicon support and can leverage the Neural Engine more effectively.

## References

- [faster-whisper GitHub Issues](https://github.com/guillaumekln/faster-whisper/issues)
- [Apple Silicon ML Compatibility](https://developer.apple.com/metal/)
- [CTranslate2 Device Support](https://github.com/OpenNMT/CTranslate2)
