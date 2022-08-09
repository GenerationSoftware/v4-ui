import React, { useRef, useState } from 'react'
import classnames from 'classnames'

import { CheckedState } from '.'

interface PrizeVideoBackgroundProps {
  className?: string
  borderRadiusClassName?: string
  didUserWinAPrize: boolean
  checkedState: CheckedState
  setCheckedAnimationFinished: () => void
}

const VIDEO_VERSION = 'v002'

enum VideoState {
  loop = 'LOOP',
  transition = 'IN'
}

enum VideoClip {
  noPrize = 'NOPRIZE',
  prize = 'PRIZE',
  rest = 'REST',
  reveal = 'REVEAL'
}

const getVideoSource = (videoClip: VideoClip, videoState: VideoState, extension: string) =>
  `/videos/PT_Loot_${videoClip}_${videoState}_${VIDEO_VERSION}.${extension}?raw=true`

export const NewPrizeVideoBackground = (props: PrizeVideoBackgroundProps) => {
  const {
    checkedState,
    didUserWinAPrize,
    className,
    setCheckedAnimationFinished,
    borderRadiusClassName
  } = props

  // const a1 = useRef<HTMLVideoElement>(null)
  const a2 = useRef<HTMLVideoElement>(null)
  const b1 = useRef<HTMLVideoElement>(null)
  const b2 = useRef<HTMLVideoElement>(null)
  const c1 = useRef<HTMLVideoElement>(null)
  const c2 = useRef<HTMLVideoElement>(null)
  const d1 = useRef<HTMLVideoElement>(null)
  const d2 = useRef<HTMLVideoElement>(null)

  const [currentVideoClip, setCurrentVideoClip] = useState<VideoClip>(VideoClip.rest)
  const [currentVideoState, setCurrentVideoState] = useState<VideoState>(VideoState.loop)
  // const [nextVideoClip, setNextVideoClip] = useState<VideoClip>(VideoClip.reveal)

  const isHidden = (videoClip: VideoClip, videoState: VideoState) => {
    if (videoClip !== currentVideoClip) return true
    if (videoState !== currentVideoState) return true
    return false
  }

  console.log({ a2 })

  const showPrizeOrNoPrize = () => {
    try {
      setCurrentVideoState(VideoState.transition)
      if (!didUserWinAPrize) {
        setCurrentVideoClip(VideoClip.noPrize)
        c1.current.play().then(console.log).catch(console.error)
        c2.current.load()
      } else {
        setCurrentVideoClip(VideoClip.prize)
        d1.current.play().then(console.log).catch(console.error)
        d2.current.load()
      }
    } catch (e) {
      console.log(e.message)
    }
  }

  return (
    <div className={classnames(className, 'h-full w-full')}>
      {/* Rest */}
      {/* Rest Transition */}
      {/* <video
        className={classnames({ 'h-0': isHidden(VideoClip.rest, VideoState.transition) })}
        ref={a1}
        playsInline
        
        autoPlay
        muted
        onLoadStart={() => {
          a2.current.load()
        }}
        onEnded={() => {
          setCurrentVideoState(VideoState.loop)
          a2.current.play()
          b1.current.load()
        }}
      >
      <source src={getVideoSource(VideoClip.rest, VideoState.transition, 'webm')} type='video/webm' />
      <source src={getVideoSource(VideoClip.rest, VideoState.transition, 'original.mp4')} type='video/mp4' />
      </video> */}
      {/* Rest Loop */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.rest, VideoState.loop),
          'z-10': !isHidden(VideoClip.rest, VideoState.loop)
        })}
        ref={a2}
        autoPlay
        playsInline
        muted
        preload='auto'
        onLoadStart={() => {
          b1.current.load()
        }}
        onEnded={() => {
          try {
            if (checkedState !== CheckedState.unchecked) {
              b1.current.play().then(console.log).catch(console.error)
              b2.current.load()
              setCurrentVideoClip(VideoClip.reveal)
              setCurrentVideoState(VideoState.transition)
            } else {
              a2.current.play().then(console.log).catch(console.error)
            }
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source src={getVideoSource(VideoClip.rest, VideoState.loop, 'webm')} type='video/webm' />
        <source
          src={getVideoSource(VideoClip.rest, VideoState.loop, 'original.mp4')}
          type='video/mp4'
        />
      </video>

      {/* Reveal */}
      {/* Reveal Transition */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.reveal, VideoState.transition),
          'z-10': !isHidden(VideoClip.reveal, VideoState.transition)
        })}
        ref={b1}
        playsInline
        muted
        onLoadStart={() => {
          b2.current.load()
        }}
        onEnded={() => {
          try {
            setCurrentVideoState(VideoState.loop)
            b2.current.play().then(console.log).catch(console.error)
            c1.current.load()
            d1.current.load()
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source
          src={getVideoSource(VideoClip.reveal, VideoState.transition, 'webm')}
          type='video/webm'
        />
        <source
          src={getVideoSource(VideoClip.reveal, VideoState.transition, 'original.mp4')}
          type='video/mp4'
        />
      </video>
      {/* Reveal Loop */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.reveal, VideoState.loop),
          'z-10': !isHidden(VideoClip.reveal, VideoState.loop)
        })}
        ref={b2}
        playsInline
        muted
        onEnded={() => {
          try {
            if (checkedState === CheckedState.checking && didUserWinAPrize === undefined) {
              b2.current.play().then(console.log).catch(console.error)
            } else {
              showPrizeOrNoPrize()
            }
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source src={getVideoSource(VideoClip.reveal, VideoState.loop, 'webm')} type='video/webm' />
        <source
          src={getVideoSource(VideoClip.reveal, VideoState.loop, 'original.mp4')}
          type='video/mp4'
        />
      </video>

      {/* No Prize */}
      {/* No Prize Transition */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.noPrize, VideoState.transition),
          'z-10': !isHidden(VideoClip.noPrize, VideoState.transition)
        })}
        ref={c1}
        playsInline
        muted
        onPlay={() => setCheckedAnimationFinished()}
        onEnded={() => {
          try {
            setCurrentVideoState(VideoState.loop)
            c2.current.play().then(console.log).catch(console.error)
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source
          src={getVideoSource(VideoClip.noPrize, VideoState.transition, 'webm')}
          type='video/webm'
        />
        <source
          src={getVideoSource(VideoClip.noPrize, VideoState.transition, 'original.mp4')}
          type='video/mp4'
        />
      </video>
      {/* No Prize Loop */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.noPrize, VideoState.loop),
          'z-10': !isHidden(VideoClip.noPrize, VideoState.loop)
        })}
        ref={c2}
        playsInline
        muted
        onEnded={() => {
          try {
            c2.current.play().then(console.log).catch(console.error)
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source
          src={getVideoSource(VideoClip.noPrize, VideoState.loop, 'webm')}
          type='video/webm'
        />
        <source
          src={getVideoSource(VideoClip.noPrize, VideoState.loop, 'original.mp4')}
          type='video/mp4'
        />
      </video>

      {/* Prize */}
      {/* Prize Transition */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.prize, VideoState.transition),
          'z-10': !isHidden(VideoClip.prize, VideoState.transition)
        })}
        ref={d1}
        playsInline
        muted
        onPlay={() => setCheckedAnimationFinished()}
        onEnded={() => {
          try {
            setCurrentVideoState(VideoState.loop)
            d2.current.play().then(console.log).catch(console.error)
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source
          src={getVideoSource(VideoClip.prize, VideoState.transition, 'webm')}
          type='video/webm'
        />
        <source
          src={getVideoSource(VideoClip.prize, VideoState.transition, 'original.mp4')}
          type='video/mp4'
        />
      </video>
      {/* Prize Loop */}
      <video
        className={classnames(borderRadiusClassName, {
          'z-0': isHidden(VideoClip.prize, VideoState.loop),
          'z-10': isHidden(VideoClip.prize, VideoState.loop)
        })}
        ref={d2}
        playsInline
        muted
        onEnded={() => {
          try {
            d2.current.play().then(console.log).catch(console.error)
          } catch (e) {
            console.log(e.message)
          }
        }}
      >
        <source src={getVideoSource(VideoClip.prize, VideoState.loop, 'webm')} type='video/webm' />
        <source
          src={getVideoSource(VideoClip.prize, VideoState.loop, 'original.mp4')}
          type='video/mp4'
        />
      </video>
    </div>
  )
}

NewPrizeVideoBackground.defaultProps = {
  borderRadiusClassName: 'rounded-lg'
}
