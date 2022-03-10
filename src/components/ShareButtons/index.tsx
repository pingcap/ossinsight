import React, {CSSProperties} from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton, RedditIcon, RedditShareButton, TelegramIcon, TelegramShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import styles from './index.module.css'

const size = 32

interface ShareButtonsProps {
  title: string
  hashtags?: string[]
  style?: CSSProperties
}

const ShareButtons = ({ title, hashtags, style }: ShareButtonsProps) => {
  const url = window.location.href

  return (
    <div className={styles.shareButtons} style={style}>
      <TwitterShareButton url={url} title={title} hashtags={hashtags}>
        <TwitterIcon round size={size} />
      </TwitterShareButton>
      <FacebookShareButton url={url} title={title} hashtag={hashtags?.[0]}>
        <FacebookIcon round size={size} />
      </FacebookShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon round size={size} />
      </LinkedinShareButton>
      <RedditShareButton url={url} title={title}>
        <RedditIcon round size={size} />
      </RedditShareButton>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon round size={size} />
      </TelegramShareButton>
    </div>
  )
}

export default ShareButtons
