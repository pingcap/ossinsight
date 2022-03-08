import React, {useMemo} from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton, RedditIcon, RedditShareButton, TelegramIcon, TelegramShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import styles from './index.module.css'

const ShareButtons = ({ title, hashtags, image }) => {
  const url = window.location.href

  return (
    <div className={styles.shareButtons}>
      <TwitterShareButton url={url} title={title} hashtags={hashtags}>
        <TwitterIcon round size={24} />
      </TwitterShareButton>
      <FacebookShareButton url={url} title={title} hashtags={hashtags}>
        <FacebookIcon round size={24} />
      </FacebookShareButton>
      <LinkedinShareButton url={url} title={title} hashtags={hashtags}>
        <LinkedinIcon round size={24} />
      </LinkedinShareButton>
      <RedditShareButton url={url} title={title} hashtags={hashtags}>
        <RedditIcon round size={24} />
      </RedditShareButton>
      <TelegramShareButton url={url} title={title} hashtags={hashtags}>
        <TelegramIcon round size={24} />
      </TelegramShareButton>
    </div>
  )
}

export default ShareButtons
