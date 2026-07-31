export type TalkBackStatus = 'idle' | 'recording' | 'playing' | 'denied' | 'unsupported'

export interface TalkBackController {
  status: TalkBackStatus
  start: () => Promise<void>
  stop: () => Promise<void>
  destroy: () => void
}

interface TalkBackOptions {
  onStatus: (status: TalkBackStatus) => void
  onError: (message: string) => void
  pitchRate?: number
}

export function createTalkBack(options: TalkBackOptions): TalkBackController {
  const pitchRate = options.pitchRate ?? 1.35
  let status: TalkBackStatus = 'idle'
  let mediaStream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let chunks: BlobPart[] = []
  let audioEl: HTMLAudioElement | null = null
  let objectUrl: string | null = null

  const setStatus = (next: TalkBackStatus) => {
    status = next
    options.onStatus(next)
  }

  const cleanupPlayback = () => {
    if (audioEl) {
      audioEl.pause()
      audioEl.src = ''
      audioEl = null
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  const stopTracks = () => {
    mediaStream?.getTracks().forEach((t) => t.stop())
    mediaStream = null
    recorder = null
  }

  const playBlob = async (blob: Blob) => {
    cleanupPlayback()
    if (blob.size < 200) {
      setStatus('idle')
      return
    }
    objectUrl = URL.createObjectURL(blob)
    audioEl = new Audio(objectUrl)
    audioEl.playbackRate = pitchRate
    audioEl.preservesPitch = false
    setStatus('playing')
    try {
      await audioEl.play()
    } catch {
      options.onError('Tap once to unlock audio, then try talk-back again.')
      setStatus('idle')
      return
    }
    await new Promise<void>((resolve) => {
      if (!audioEl) {
        resolve()
        return
      }
      audioEl.onended = () => resolve()
      audioEl.onerror = () => resolve()
    })
    cleanupPlayback()
    setStatus('idle')
  }

  return {
    get status() {
      return status
    },

    async start() {
      if (status === 'recording' || status === 'playing') return
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setStatus('unsupported')
        options.onError('Talk-back needs a browser with microphone recording support.')
        return
      }
      cleanupPlayback()
      chunks = []
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
      } catch {
        setStatus('denied')
        options.onError('Microphone permission denied. Allow mic access to talk with your pet.')
        return
      }

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : ''

      try {
        recorder = mime
          ? new MediaRecorder(mediaStream, { mimeType: mime })
          : new MediaRecorder(mediaStream)
      } catch {
        stopTracks()
        setStatus('unsupported')
        options.onError('Could not start the microphone recorder.')
        return
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      recorder.start(100)
      setStatus('recording')
      options.onError('')
    },

    async stop() {
      if (status !== 'recording' || !recorder) {
        stopTracks()
        if (status === 'recording') setStatus('idle')
        return
      }

      const blob = await new Promise<Blob>((resolve) => {
        const rec = recorder!
        rec.onstop = () => {
          resolve(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }))
        }
        try {
          rec.stop()
        } catch {
          resolve(new Blob([]))
        }
      })

      stopTracks()
      await playBlob(blob)
    },

    destroy() {
      try {
        if (recorder && recorder.state !== 'inactive') recorder.stop()
      } catch {
        /* ignore */
      }
      stopTracks()
      cleanupPlayback()
      setStatus('idle')
    },
  }
}
