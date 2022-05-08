import React, {CSSProperties} from "react";
import {
  TwitterIcon,
  TwitterShareButton,
  LinkedinIcon,
  LinkedinShareButton, 
  TelegramIcon,
  TelegramShareButton,
  RedditIcon,
  RedditShareButton
} from "react-share";
import styles from './index.module.css'

const size = 32

interface ShareButtonsProps {
  disabled?: boolean
  shareUrl?: string
  title: string
  hashtags?: string[]
  style?: CSSProperties
}

const ShareButtons = ({ shareUrl, disabled = false, title, hashtags, style }: ShareButtonsProps) => {
  const url = shareUrl ?? window.location.href

  return (
    <div className={styles.shareButtons} style={style}>
      <TwitterShareButton url={url} title={title} hashtags={hashtags}>
        <TwitterIcon round size={size} />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon round size={size} />
      </LinkedinShareButton>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon round size={size} />
      </TelegramShareButton>
      <RedditShareButton url={url} title={title}>
        <RedditIcon round size={size} />
      </RedditShareButton>
    </div>
  )
}

export default ShareButtons
