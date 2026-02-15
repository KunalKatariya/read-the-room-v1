"""
Example fix for faster-whisper on M4 MacBook

This file demonstrates how to fix the "IndexError: vector" issue
when using faster-whisper on Apple Silicon (M1/M2/M3/M4) Macs.

Apply this pattern to your satori-cli transcriber.py file.
"""

import platform
import numpy as np
from typing import Optional, Tuple, Any
import logging

logger = logging.getLogger(__name__)


class TranscriberFixed:
    """
    Fixed transcriber class that handles M4 MacBook CoreML issues.
    
    This implementation forces CPU backend on Apple Silicon to avoid
    the CoreML vector indexing errors.
    """
    
    def __init__(self, model_size: str = "base"):
        """
        Initialize the transcriber with M4-compatible settings.
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
        """
        from faster_whisper import WhisperModel
        
        # Detect if running on Apple Silicon
        is_apple_silicon = (
            platform.machine() == "arm64" and 
            platform.system() == "Darwin"
        )
        
        logger.info(f"Initializing Whisper model: {model_size}")
        logger.info(f"Platform: {platform.system()} {platform.machine()}")
        logger.info(f"Apple Silicon detected: {is_apple_silicon}")
        
        if is_apple_silicon:
            # Force CPU backend on Apple Silicon to avoid CoreML vector errors
            logger.info("Using CPU backend for Apple Silicon compatibility")
            self._model = WhisperModel(
                model_size,
                device="cpu",
                compute_type="int8"  # Efficient on M-series chips
            )
            self._device = "cpu"
        else:
            # Use auto-detection for other platforms
            logger.info("Using auto-detection for device")
            self._model = WhisperModel(model_size)
            self._device = "auto"
    
    def transcribe(
        self,
        audio: np.ndarray,
        language: Optional[str] = None,
        **kwargs
    ) -> Tuple[Any, Any]:
        """
        Transcribe audio with proper error handling.
        
        Args:
            audio: Audio data as numpy array (float32, 16kHz)
            language: Optional language code (e.g., "en")
            **kwargs: Additional parameters for transcription
        
        Returns:
            Tuple of (segments, info) from faster-whisper
        """
        # Validate audio input
        if not isinstance(audio, np.ndarray):
            raise TypeError(f"Audio must be numpy array, got {type(audio)}")
        
        if audio.dtype != np.float32:
            logger.warning(f"Converting audio from {audio.dtype} to float32")
            audio = audio.astype(np.float32)
        
        logger.debug(
            f"Audio ready - shape: {audio.shape}, dtype: {audio.dtype}, "
            f"min: {audio.min():.6f}, max: {audio.max():.6f}"
        )
        
        try:
            # First attempt with all parameters
            segments, info = self._model.transcribe(
                audio,
                language=language,
                **kwargs
            )
            logger.info("Transcription successful")
            return segments, info
            
        except (IndexError, RuntimeError) as e:
            error_msg = str(e)
            
            # Check if this is the vector error we're trying to fix
            if "vector" in error_msg.lower():
                logger.warning(
                    f"Vector/Index error in model: {error_msg}"
                )
                
                # If we're already on CPU, this shouldn't happen
                if self._device == "cpu":
                    logger.error(
                        "Vector error occurred even on CPU backend. "
                        "This may indicate a model file corruption."
                    )
                    raise RuntimeError(
                        f"Transcription failed on CPU backend: {error_msg}"
                    ) from e
                
                # Try to reinitialize with CPU backend
                logger.warning("Attempting to reinitialize with CPU backend")
                from faster_whisper import WhisperModel
                
                self._model = WhisperModel(
                    self._model.model_size_or_path,
                    device="cpu",
                    compute_type="int8"
                )
                self._device = "cpu"
                
                # Retry transcription
                segments, info = self._model.transcribe(audio, **kwargs)
                logger.info("Transcription successful after CPU fallback")
                return segments, info
            
            # If it's a different error, re-raise
            raise
    
    @property
    def device(self) -> str:
        """Return the device being used for inference."""
        return self._device


def example_usage():
    """
    Example usage of the fixed transcriber.
    """
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create transcriber
    transcriber = TranscriberFixed(model_size="base")
    
    # Create test audio (1 second of silence at 16kHz)
    sample_rate = 16000
    duration = 1.0
    test_audio = np.zeros(int(sample_rate * duration), dtype=np.float32)
    
    # Add a small sine wave to test actual transcription
    # (silence often doesn't produce output)
    t = np.linspace(0, duration, int(sample_rate * duration))
    test_audio += 0.1 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
    
    logger.info(f"Testing transcription on device: {transcriber.device}")
    
    try:
        segments, info = transcriber.transcribe(test_audio, language="en")
        
        logger.info(f"Transcription info: {info}")
        logger.info("Segments:")
        for segment in segments:
            logger.info(f"  [{segment.start:.2f}s - {segment.end:.2f}s] {segment.text}")
        
        print("\n✅ Transcription successful!")
        print(f"Device used: {transcriber.device}")
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        print("\n❌ Transcription failed!")
        raise


if __name__ == "__main__":
    example_usage()
