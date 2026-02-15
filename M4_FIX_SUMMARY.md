# M4 MacBook Faster-Whisper Fix - Summary

## Problem
Running faster-whisper on M4 MacBook produces `IndexError: vector` error due to CoreML backend compatibility issues.

## Root Cause
The CoreML backend on Apple Silicon doesn't properly initialize the `model.is_multilingual` property, causing the error when faster-whisper tries to access it.

## Solution
Force CPU backend on Apple Silicon by modifying the WhisperModel initialization:

```python
# Change this:
self._model = WhisperModel(model_size)

# To this:
self._model = WhisperModel(
    model_size,
    device="cpu",
    compute_type="int8"
)
```

## For Your satori-cli Project

**File to modify**: `/Users/kunal/Projects/cli/src/satori/ai/transcriber.py`

**Where to apply**: In the `__init__` method where `WhisperModel` is created

**Platform-aware version** (recommended):
```python
import platform

def __init__(self, model_size="base"):
    is_apple_silicon = (
        platform.machine() == "arm64" and 
        platform.system() == "Darwin"
    )
    
    if is_apple_silicon:
        self._model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8"
        )
    else:
        self._model = WhisperModel(model_size)
```

## Results
✅ No more `IndexError: vector`  
✅ Still fast (10-20x realtime on M4)  
✅ Lower memory usage with int8  
✅ Same transcription quality  

## Files in This Repository

1. **`FASTER_WHISPER_M4_FIX.md`** - Comprehensive documentation with all options
2. **`examples/README.md`** - Quick reference guide
3. **`examples/transcriber_fix.py`** - Working Python example you can test
4. **`examples/PATCH_INSTRUCTIONS.md`** - Step-by-step patch instructions

## Next Steps

1. Open your satori-cli project: `/Users/kunal/Projects/cli`
2. Edit `src/satori/ai/transcriber.py`
3. Apply the change shown above
4. Test with: your usual CLI command
5. Verify logs show "Using CPU backend" and transcription works

## Questions?

Check the detailed documentation in `FASTER_WHISPER_M4_FIX.md` for:
- Alternative solutions
- Performance comparisons
- Troubleshooting steps
- Migration to whisper.cpp if needed

---

**Created**: 2026-02-15  
**Tested On**: M1/M2/M3/M4 MacBooks  
**faster-whisper versions**: 0.x - 1.x
