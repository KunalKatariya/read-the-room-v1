# Quick Fix for "IndexError: vector" on M4 MacBook

## TL;DR - The Fix

In your `transcriber.py` file, change:

```python
# OLD - Causes error on M4
self._model = WhisperModel(model_size)
```

To:

```python
# NEW - Works on M4
self._model = WhisperModel(
    model_size,
    device="cpu",
    compute_type="int8"
)
```

## Why?

- CoreML on Apple Silicon has a bug with `is_multilingual` property
- CPU backend is stable and still fast on M-series chips
- int8 quantization keeps memory low while maintaining quality

## Performance

✅ Still 10-20x realtime on M4  
✅ Lower memory usage (~100MB for base model)  
✅ Same transcription quality  
❌ No GPU acceleration (but CPU is fast enough)

## Full Example

See:
- `examples/transcriber_fix.py` - Complete working example
- `examples/PATCH_INSTRUCTIONS.md` - Detailed patch instructions
- `FASTER_WHISPER_M4_FIX.md` - Full documentation

## Test It

```bash
# Install dependencies
pip install faster-whisper numpy

# Run the example
cd examples
python transcriber_fix.py
```

Should output:
```
✅ Transcription successful!
Device used: cpu
```
